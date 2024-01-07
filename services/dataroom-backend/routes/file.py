# api/routes/file.py
import os
from flask import Blueprint, jsonify, request, current_app, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.models import db, File, Folder, DataRoom

file_routes = Blueprint('file', __name__)

@file_routes.route('/file/<int:file_id>', methods=['GET'])
@jwt_required()
def view_file(file_id):
    current_user_id = get_jwt_identity()
    try:
        # Start a transaction
        with db.session.begin():
            file = File.query.get(file_id)

            # Ensure that the file exists and belongs to the current user
            if not file:
                return jsonify({"message": "File not found"}), 404

            if current_user_id != file.owner_id:
                return jsonify({"msg": "Unauthorized"}), 401
            
            # Fetch the file path from the database
            user_upload_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], 'user-' + str(current_user_id), 'data-room-' + str(file.parent_data_room_id), 'folder-' + str(file.parent_folder_id))
            file_path = os.path.join(user_upload_folder, file.content)

            # Check if the file exists
            if os.path.exists(file_path):
                # Send the file as a response
                return send_file(file_path, as_attachment=True)
            else:
                return jsonify({"message": "File not found"}), 404

    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500
     
@file_routes.route('/file', methods=['POST'])
@jwt_required()
def create_file():
    current_user_id = get_jwt_identity()
    data = request.form
    if not data:
        return jsonify({"message": "No form data in request body"}), 400
    
    name = data.get('name')
    if not name:
        return jsonify({"message": "name are required"}), 400
    
    # Determine where to create the file
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
                
            # Ensure that the file name is unique within the parent folder
            existing_file = File.query.filter_by(name=name, parent_data_room_id=parent_data_room_id, parent_folder_id=parent_folder_id).first()
            if existing_file:
                return jsonify({"message": "File already exists"}), 400
                
            # Handle file upload
            uploaded_file = request.files['files']
            if uploaded_file:
                if not uploaded_file:
                    return jsonify({"message": "No file provided"}), 400

                # New addition: Create user-specific subdirectory
                user_upload_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], 'user-' + str(current_user_id), 'data-room-' + str(parent_data_room_id), 'folder-' + str(parent_folder_id))
                os.makedirs(user_upload_folder, exist_ok=True)  # Ensure the user's folder exists

                file_path = os.path.join(user_upload_folder, uploaded_file.filename)
                uploaded_file.save(file_path)

                # Save the file path in the database
                new_file = File(name=name, content=file_path, owner_id=current_user_id, parent_data_room_id=parent_data_room_id, parent_folder_id=parent_folder_id)
                db.session.add(new_file)
                db.session.commit()

            return jsonify({"msg": "File created successfully"})
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500

@file_routes.route('/file/<int:file_id>', methods=['PUT'])
@jwt_required()
def move_file(file_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({"message": "No JSON data in request body"}), 400
    
    name = data.get('name')
    if not name:
        return jsonify({"message": "name is required"}), 400

    # Determine where to move the file
    parent_data_room_id = data.get('parent_data_room_id')
    parent_folder_id = data.get('parent_folder_id')
    if not parent_data_room_id:
        return jsonify({"message": "parent_data_room_id is required"}), 400 
        
    try:
        # Start a transaction
        with db.session.begin():
            # Ensure that the file exists and belongs to the current user
            print(file_id, parent_data_room_id, parent_folder_id)

            file = File.query.get(file_id)
            if not file:
                return jsonify({"message": "File not found"}), 404
            if current_user_id != file.owner_id:
                return jsonify({"msg": "Unauthorized"}), 401

            # Ensure the parent data room exists and belongs to the current user
            # Out of the box support for moving files between data rooms, add if there's time
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
            
            # Ensure that the file doesn't already exist within the target folder
            existing_file = File.query.filter_by(name=name, parent_data_room_id=parent_data_room_id, parent_folder_id=parent_folder_id).first()
            if existing_file:
                return jsonify({"message": "File name already exists"}), 400

            # Move the file
            file.name = name
            file.parent_data_room_id = parent_data_room_id
            file.parent_folder_id = parent_folder_id
            db.session.commit()
            return jsonify({"msg": "File renamed successfully"})
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500

@file_routes.route('/file/<int:file_id>', methods=['DELETE'])
@jwt_required()
def delete_file(file_id):
    current_user_id = get_jwt_identity()

    try:
        with db.session.begin():
            file = File.query.get(file_id)
            if not file:
                return jsonify({"message": "File not found"}), 404

            if current_user_id != file.owner_id:
                return jsonify({"msg": "Unauthorized"}), 401

            # Delete the file from storage
            file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'user-' + str(current_user_id), 'data-room-' + str(file.parent_data_room_id), 'folder-' + str(file.parent_folder_id), file.content)
            print(file_path)
            if os.path.exists(file_path):
                os.remove(file_path)

            # Delete the file from the database
            db.session.delete(file)
            db.session.commit()

            return jsonify({"msg": "File deleted successfully"})
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500