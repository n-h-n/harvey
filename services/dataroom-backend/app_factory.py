# app_factory.py
import os
from flask import Flask, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from routes import auth, user, data_room, file, folder
from database import initialize_database

def create_app():
    app = Flask(__name__)

    # Set the SQLALchemy database URI from environment variable or use a local SQLite database
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or 'sqlite:///database/data.db'
    # Disable SQLAlchemy modification tracker due to performance overhead
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    # Set the JWT secret key from environment variable or generate a new one
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY') or 'TEST_SECRET_KEY'

    # Set the UPLOAD_FOLDER configuration using a relative path
    current_script_directory = os.path.dirname(os.path.abspath(__file__))
    app.config['UPLOAD_FOLDER'] = os.path.join(current_script_directory, 'uploads')

    # Initialize database
    initialize_database(app)

    # Initialize JWTManager
    jwt = JWTManager(app)

    # Initialize CORS
    CORS(app)

    # Set CORS options on preflight requests
    @app.before_request
    def before_request():
        if request.method == 'OPTIONS':
            # Set the allowed methods for CORS
            response_headers = {
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }

            # Respond with a 200 OK status and the CORS headers
            return ('', 200, response_headers)


    # Register Blueprints
    app.register_blueprint(auth.auth_routes)
    app.register_blueprint(user.user_routes)
    app.register_blueprint(data_room.data_room_routes)
    app.register_blueprint(file.file_routes)
    app.register_blueprint(folder.folder_routes)
    
    return app
