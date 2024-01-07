# models.py
from . import db

'''
Hierarchical structure of the app models:

    User
    |
    |-- DataRoom 1
    |   |
    |   |-- File 1
    |   |
    |   |-- Folder 1
    |       |
    |       |-- File 2
    |
    |-- DataRoom 2
        |
        |-- File 4
        |
        |-- Folder 3
            |
            |-- File 5
            |
            |-- File 6
            |
            |-- Folder 4
                |
                |-- File 7
'''

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    
    # One-to-many relationship with DataRoom
    data_rooms = db.relationship('DataRoom', backref='user', lazy=True)

class DataRoom(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    
    # Foreign key relationship with User
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    
    # One-to-many relationships with File and Folder
    children_files = db.relationship('File', backref='data_room', lazy=True, cascade='all, delete-orphan')
    children_folders = db.relationship('Folder', backref='data_room', lazy=True, cascade='all, delete-orphan')

class Folder(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    
    # Foreign key relationship with DataRoom and User
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    parent_data_room_id = db.Column(db.Integer, db.ForeignKey('data_room.id'), nullable=False)
    
    # Self-referential relationship for parent-child Folders
    parent_folder_id = db.Column(db.Integer, db.ForeignKey('folder.id'))
    
    # One-to-many relationships with File and Folder
    children_folders = db.relationship('Folder', backref=db.backref('parent', remote_side=[id]), lazy=True, cascade='all, delete-orphan')    
    children_files = db.relationship('File', backref='folder', lazy=True, cascade='all, delete-orphan')

class File(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    content = db.Column(db.String(100), nullable=False)
    
    # Foreign key relationship with DataRoom, User, and Folder
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    parent_data_room_id = db.Column(db.Integer, db.ForeignKey('data_room.id'), nullable=False)
    parent_folder_id = db.Column(db.Integer, db.ForeignKey('folder.id'))
