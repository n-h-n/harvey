# database.py
from flask_sqlalchemy import SQLAlchemy
from flask import jsonify
from sqlalchemy.exc import SQLAlchemyError

db = SQLAlchemy()

def initialize_database(app):
    with app.app_context():
        db.init_app(app)

        # Configure SQLAlchemy error handler
        @app.errorhandler(SQLAlchemyError)
        def handle_database_error(error):
            print(f"SQLAlchemy error: {error}")
            return jsonify({"error": "Database error", "message": str(error)}), 500

        try:
            db.create_all()
        except SQLAlchemyError as e:
            handle_database_error(e)
