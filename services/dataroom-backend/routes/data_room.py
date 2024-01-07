# api/routes/data_room.py
import os, shutil
from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.models import db, DataRoom

data_room_routes = Blueprint('data_room', __name__)

@data_room_routes.route('/data-room', methods=['GET'])
@jwt_required()
def get_user_data_rooms():
    current_user_id = get_jwt_identity()
    try:
        # Start a transaction
        with db.session.begin():
            # Query the database to get all data rooms for the current user
            user_data_rooms = DataRoom.query.filter_by(owner_id=current_user_id).all()
            if not user_data_rooms:
                return jsonify({}), 200

            # Return as JSON, no pagination for now
            data_rooms = []
            for data_room in user_data_rooms:
                data_rooms.append({
                    "id": data_room.id,
                    "name": data_room.name,
                    "files": [{"id": file.id, "name": file.name} for file in data_room.children_files if file.parent_folder_id is None],
                    "folders": [{"id": folder.id, "name": folder.name} for folder in data_room.children_folders if folder.parent_folder_id is None]
                })
            return jsonify(user_data_rooms=data_rooms)
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500

@data_room_routes.route('/data-room/<int:data_room_id>', methods=['GET'])
@jwt_required()
def get_data_room(data_room_id):
    current_user_id = get_jwt_identity()
    try:
        # Start a transaction
        with db.session.begin():
            data_room = DataRoom.query.get(data_room_id)

            if not data_room:
                return jsonify({"message": "Data Room not found"}), 404

            if current_user_id != data_room.owner_id:
                return jsonify({"msg": "Unauthorized"}), 401
            
            files = data_room.children_files
            folders = data_room.children_folders

            for file in files:
                if current_user_id != file.owner_id:
                    return jsonify({"msg": "Unauthorized"}), 401

            for folder in folders:
                if current_user_id != folder.owner_id:
                    return jsonify({"msg": "Unauthorized"}), 401

            return jsonify({
                "id": data_room.id,
                "name": data_room.name,
                "files": [{"id": file.id, "name": file.name} for file in files if file.parent_folder_id is None],
                "folders": [{"id": folder.id, "name": folder.name} for folder in folders if folder.parent_folder_id is None]
            })
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500

@data_room_routes.route('/data-room', methods=['POST'])
@jwt_required()
def create_data_room():
    data = request.get_json()
    if not data:
        return jsonify({"message": "No JSON data in request body"}), 400
    
    current_user_id = get_jwt_identity()
    name = data.get('name')

    # Verify that name and owner_id are not empty, no sanitization yet
    if not name or not current_user_id:
        return jsonify({"message": "Name and owner_id are required"}), 400
    
    try:
        # Start a transaction
        with db.session.begin():
            # Check if the data room already exists
            existing_data_room = DataRoom.query.filter_by(name=name, owner_id=current_user_id).first()
            if existing_data_room:
                return jsonify({"message": "Data Room already exists"}), 400

            new_data_room = DataRoom(name=name, owner_id=current_user_id)
            db.session.add(new_data_room)
            db.session.commit()

            return jsonify({"message": "Data Room created successfully"}), 201
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500

@data_room_routes.route('/data-room/<int:data_room_id>', methods=['PUT'])
@jwt_required()
def rename_data_room(data_room_id):
    current_user_id = get_jwt_identity()
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "No JSON data in request body"}), 400

        # Start a transaction
        with db.session.begin():
            data_room = DataRoom.query.get(data_room_id)

            if not data_room:
                return jsonify({"message": "Data Room not found"}), 404

            if current_user_id != data_room.owner_id:
                return jsonify({"msg": "Unauthorized"}), 401

            new_name = data.get('name')
            if not new_name:
                return jsonify({"message": "New name is required"}), 400

            data_room.name = new_name
            db.session.commit()
        
        files = data_room.children_files
        folders = data_room.children_folders

        for file in files:
            if current_user_id != file.owner_id:
                return jsonify({"msg": "Unauthorized"}), 401

        for folder in folders:
            if current_user_id != folder.owner_id:
                return jsonify({"msg": "Unauthorized"}), 401

        return jsonify({
            "id": data_room.id,
            "name": data_room.name,
            "files": [{"id": file.id, "name": file.name} for file in files if file.parent_folder_id is None],
            "folders": [{"id": folder.id, "name": folder.name} for folder in folders if folder.parent_folder_id is None]
        })
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500


@data_room_routes.route('/data-room/<int:data_room_id>', methods=['DELETE'])
@jwt_required()
def delete_data_room(data_room_id):
    current_user_id = get_jwt_identity()
    try:
        # Start a transaction
        with db.session.begin():
            data_room = DataRoom.query.get(data_room_id)

            if not data_room:
                return jsonify({"message": "Data Room not found"}), 404

            if current_user_id != data_room.owner_id:
                return jsonify({"msg": "Unauthorized"}), 401

            # Delete the entire data room directory from the storage
            data_room_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'user-' + str(current_user_id), 'data-room-' + str(data_room.id))
            if os.path.exists(data_room_path):
                shutil.rmtree(data_room_path)

            print('delete data room path', data_room_path)
            # Delete the data room and let SQLAlchemy handle cascading deletes
            db.session.delete(data_room)

            # Commit changes to the database
            db.session.commit()

            return jsonify({"message": "Data Room deleted successfully"}), 200
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500

