# api/routes/folder.py
import os, shutil
from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.models import db, Folder, DataRoom, File

folder_routes = Blueprint('folder', __name__)

@folder_routes.route('/folder/<int:folder_id>', methods=['GET'])
@jwt_required()
def view_folder(folder_id):
    current_user_id = get_jwt_identity()

    try:
        # Start a transaction
        with db.session.begin():

            # Retrieve the folder from the database
            folder = Folder.query.get(folder_id)

            if not folder:
                return jsonify({"message": "Folder not found"}), 404

            if current_user_id != folder.owner_id:
                return jsonify({"msg": "Unauthorized"}), 401
            # Return folder details
            return jsonify({
                "id": folder.id,
                "name": folder.name,
                "parent_data_room_id": folder.parent_data_room_id,
                "parent_folder_id": folder.parent_folder_id,
                "owner_id": folder.owner_id,
                "children_folders": [{"id": folder.id, "name": folder.name} for folder in folder.children_folders],
                "children_files": [{"id": file.id, "name": file.name} for file in folder.children_files],
            }), 200
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500

@folder_routes.route('/folder', methods=['POST'])
@jwt_required()
def create_folder():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({"message": "No JSON data in request body"}), 400

    name = data.get('name')
    parent_data_room_id = data.get('parent_data_room_id')
    parent_folder_id = data.get('parent_folder_id')
    if not parent_data_room_id:
        return jsonify({"message": "parent_data_room_id is required"}), 400

    try:
        # Start a transaction
        with db.session.begin():

            # Ensure the parent data room exists and belongs to the current user
            data_room = DataRoom.query.get(parent_data_room_id)
            if not data_room:
                return jsonify({"message": "Data Room not found"}), 404
            if current_user_id != data_room.owner_id:
                return jsonify({"msg": "Unauthorized"}), 401
            
            # Ensure that if parent folder exists, it belongs to the current user
            if parent_folder_id:
                parent_folder = Folder.query.get(parent_folder_id)
                if not parent_folder:
                    return jsonify({"message": "Folder not found"}), 404
                if current_user_id != parent_folder.owner_id:
                    return jsonify({"msg": "Unauthorized"}), 401
                
            # Ensure that the folder name is unique within the parent folder
            existing_folder = Folder.query.filter_by(name=name, parent_data_room_id=parent_data_room_id, parent_folder_id=parent_folder_id).first()
            if existing_folder:
                return jsonify({"message": "Folder already exists"}), 400
                
            # Create the folder
            new_folder = Folder(name=name, parent_data_room_id=parent_data_room_id, parent_folder_id=parent_folder_id, owner_id=current_user_id)
            db.session.add(new_folder)
            db.session.commit()

            return jsonify({"msg": "Folder created successfully"}), 201
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500
    

@folder_routes.route('/folder/<int:folder_id>', methods=['PUT'])
@jwt_required()
def move_folder(folder_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({"message": "No JSON data in request body"}), 400
    
    name = data.get('name')
    if not name:
        return jsonify({"message": "name is required"}), 400

    # Determine where to move the folder
    parent_data_room_id = data.get('parent_data_room_id')
    parent_folder_id = data.get('parent_folder_id')
    if not parent_data_room_id:
        return jsonify({"message": "parent_data_room_id is required"}), 400 
    
    try:
        # Start a transaction
        with db.session.begin():
            # Ensure that the folder exists and belongs to the current user
            folder = Folder.query.get(folder_id)
            if not folder:
                return jsonify({"message": "Folder not found"}), 404
            if current_user_id != folder.owner_id:
                return jsonify({"msg": "Unauthorized"}), 401

            # Ensure the parent data room exists and belongs to the current user
            # Out of the box support for moving folders between data rooms, add if there's time
            data_room = DataRoom.query.get(parent_data_room_id)
            if not data_room:
                return jsonify({"message": "Data Room not found"}), 404
            if current_user_id != data_room.owner_id:
                return jsonify({"msg": "Unauthorized"}), 401
            
            # Ensure that if parent folder exists, it belongs to the current user
            if parent_folder_id:
                parent_folder = Folder.query.get(parent_folder_id)
                if not parent_folder:
                    return jsonify({"message": "Folder not found"}), 404
                if current_user_id != parent_folder.owner_id:
                    return jsonify({"msg": "Unauthorized"}), 401
            
            # Ensure that the folder doesn't already exist within the target folder
            existing_folder = Folder.query.filter_by(name=name, parent_data_room_id=parent_data_room_id, parent_folder_id=parent_folder_id).first()
            if existing_folder:
                return jsonify({"message": "Folder already exists"}), 400
            
            print(folder.name, name)

            # Move the folder
            folder.name = name
            folder.parent_data_room_id = parent_data_room_id
            folder.parent_folder_id = parent_folder_id

            # Return folder details
            return jsonify({
                "id": folder.id,
                "name": folder.name,
                "parent_data_room_id": folder.parent_data_room_id,
                "parent_folder_id": folder.parent_folder_id,
                "owner_id": folder.owner_id,
                "children_folders": [{"id": folder.id, "name": folder.name} for folder in folder.children_folders],
                "children_files": [{"id": file.id, "name": file.name} for file in folder.children_files],
            }), 200
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500


@folder_routes.route('/folder/<int:folder_id>', methods=['DELETE'])
@jwt_required()
def delete_folder(folder_id):
    current_user_id = get_jwt_identity()

    try:
        # Start a transaction
        with db.session.begin():
            folder = Folder.query.get(folder_id)
            if not folder:
                return jsonify({"message": "Folder not found"}), 404

            if current_user_id != folder.owner_id:
                return jsonify({"msg": "Unauthorized"}), 401

            # Delete the entire folder directory from the storage
            folder_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'user-' + str(current_user_id), 'data-room-' + str(folder.parent_data_room_id), 'folder-' + str(folder.id))
            print('delete folder path', folder_path)
            if os.path.exists(folder_path):
                shutil.rmtree(folder_path)

            # Delete the folder from the database
            db.session.delete(folder)
            db.session.commit()

            return jsonify({"msg": "Folder deleted successfully"}), 200
    except Exception as e:
        print(e)
        return jsonify({"message": f"Error: {str(e)}"}), 500
