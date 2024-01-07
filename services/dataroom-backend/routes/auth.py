# api/routes/auth.py
from flask import Blueprint, jsonify, request, url_for, redirect
from flask_jwt_extended import create_access_token
from database.models import db, User
from datetime import timedelta

auth_routes = Blueprint('auth', __name__)

@auth_routes.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"msg": "Missing JSON in request"}), 400
        
        req_username = data.get('username')
        # No real auth for now, to facilitate demo
        user = User.query.filter_by(username=req_username).first()
        if not user:
            return create_mock_user(req_username)
        access_token = create_access_token(identity=user.id, expires_delta=timedelta(hours=12))
        return jsonify(access_token=access_token), 200
    except Exception as e:
        print(e)
        return jsonify({"message": f"Error: {str(e)}"}), 500


def create_mock_user(username):
    email = username + "@example.com"
    try:
        # Start a transaction
        new_user = User(username=username, email=email)
        db.session.add(new_user)
        db.session.commit()

        access_token = create_access_token(identity=new_user.id, expires_delta=timedelta(hours=12))
        return jsonify(access_token=access_token), 200
    except Exception as e:
        print(e)
        return jsonify({"message": f"Error: {str(e)}"}), 500