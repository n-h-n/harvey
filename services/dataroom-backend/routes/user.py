# api/routes/user.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from database.models import db, User

user_routes = Blueprint('user', __name__)

@user_routes.route('/user', methods=['GET'])
@jwt_required()
def get_user():
    current_user_id = get_jwt_identity()

    try:
        # Start a transaction
        with db.session.begin():

            # Retrieve the user from the database
            user = User.query.get(current_user_id)

            if not user:
                return jsonify({"message": "User not found"}), 404

            # Return the user's details
            return jsonify({
                "id": user.id,
                "username": user.username,
                "email": user.email
            }), 200
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500

@user_routes.route('/user', methods=['POST'])
def create_user():
    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid request"}), 400
    
    username = data.get('username')
    email = data.get('email')

    # Verify that username and email are not empty, no sanitization yet
    if not username or not email:
        return jsonify({"message": "Username and email are required"}), 400
    
    try:
        # Start a transaction
        with db.session.begin():
            # Check if the username or email already exists
            existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
            if existing_user:
                return jsonify({"message": "Username or email already exists"}), 400

            new_user = User(username=username, email=email)
            db.session.add(new_user)
            db.session.commit()

            access_token = create_access_token(identity=new_user.id, expires_delta=timedelta(hours=12))
            return jsonify(access_token=access_token), 200
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500

@user_routes.route('/user', methods=['PUT'])
@jwt_required()
def edit_user():
    current_user_id = get_jwt_identity()

    # Get updated data from the request
    data = request.get_json()
    if not data:
        return jsonify({"message": "No JSON data in request body"}), 400
    
    updated_username = data.get('username')
    updated_email = data.get('email')
    
    # Verify that username and email are not empty, no sanitization yet
    if not updated_username or not updated_email:
        return jsonify({"message": "Username and email are required"}), 400
    
    try:
        # Start a transaction
        with db.session.begin():
            # Retrieve the user from the database
            user = User.query.get(current_user_id)

            if not user:
                return jsonify({"message": "User not found"}), 404

            # Check if the username or email already exists
            # This should be more efficient than looking through the entire db
            existing_user = User.query.filter((User.username == updated_username) | (User.email == updated_email)).first()
            if existing_user:
                return jsonify({"message": "Username or email already exists"}), 400

            # Update the user's attributes
            user.username = updated_username
            user.email = updated_email

            # Commit the changes to the database
            db.session.commit()
            
            return jsonify({"message": "User updated successfully"}), 200
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500

@user_routes.route('/user', methods=['DELETE'])
@jwt_required()
def delete_user():
    current_user_id = get_jwt_identity()

    try:
        # Start a transaction
        with db.session.begin():
            # Retrieve the user from the database
            user = User.query.get(current_user_id)

            if not user:
                return jsonify({"message": "User not found"}), 404

            # Delete the user from the database
            db.session.delete(user)
            db.session.commit()

            return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500

