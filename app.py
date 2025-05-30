from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import CheckConstraint
import os

# Initialize Flask app
app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# Configure SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///designers.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define the Designer model with constraints
class Designer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    rating = db.Column(db.Float, default=0.0)
    description = db.Column(db.Text)
    projects = db.Column(db.Integer)
    years = db.Column(db.Integer)
    price = db.Column(db.String(10))
    phone1 = db.Column(db.String(20))
    phone2 = db.Column(db.String(20))
    isShortlisted = db.Column(db.Boolean, default=False)
    isHidden = db.Column(db.Boolean, default=False)

    __table_args__ = (
        CheckConstraint('rating >= 0 AND rating <= 5', name='check_rating_range'),
        CheckConstraint('projects >= 0', name='check_projects_positive'),
        CheckConstraint('years >= 0', name='check_years_positive'),
    )

    def to_dict(self):
        return {col.name: getattr(self, col.name) for col in self.__table__.columns}

# Create database tables before the first request
with app.app_context():
    db.create_all()

# API Endpoints
@app.route('/api/listings', methods=['GET'])
def get_listings():
    """Get all designer listings with optional filtering"""
    query = request.args.get('q', '', type=str)
    min_rating = request.args.get('min_rating', type=float)
    max_price = request.args.get('max_price', type=str)
    show_hidden = request.args.get('show_hidden', 'false').lower() == 'true'

    designers = Designer.query

    if query:
        search = f"%{query.lower()}%"
        designers = designers.filter(Designer.name.ilike(search))

    if min_rating is not None:
        designers = designers.filter(Designer.rating >= min_rating)

    if max_price is not None:
        designers = designers.filter(Designer.price <= max_price)

    if not show_hidden:
        designers = designers.filter(Designer.isHidden == False)

    results = [d.to_dict() for d in designers.all()]
    return jsonify(results)

@app.route('/api/listings', methods=['POST'])
def add_designer():
    """Add a new designer listing"""
    data = request.get_json()

    # Input validation
    if not data.get('name'):
        return jsonify({"error": "Name is required"}), 400
    if data.get('rating') and (data['rating'] < 0 or data['rating'] > 5):
        return jsonify({"error": "Rating must be between 0 and 5"}), 400
    if data.get('projects') and data['projects'] < 0:
        return jsonify({"error": "Projects count cannot be negative"}), 400
    if data.get('years') and data['years'] < 0:
        return jsonify({"error": "Years of experience cannot be negative"}), 400

    try:
        designer = Designer(
            name=data.get('name'),
            rating=data.get('rating', 0),
            description=data.get('description', ''),
            projects=data.get('projects', 0),
            years=data.get('years', 0),
            price=data.get('price', ''),
            phone1=data.get('phone1', ''),
            phone2=data.get('phone2', ''),
            isShortlisted=data.get('isShortlisted', False),
            isHidden=data.get('isHidden', False)
        )
        db.session.add(designer)
        db.session.commit()
        return jsonify({"message": "Designer added", "designer": designer.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/listings/<int:designer_id>', methods=['GET'])
def get_designer(designer_id):
    """Get a single designer by ID"""
    designer = Designer.query.get_or_404(designer_id)
    return jsonify(designer.to_dict())

@app.route('/api/listings/<int:designer_id>', methods=['PUT'])
def update_designer(designer_id):
    """Update an existing designer"""
    designer = Designer.query.get_or_404(designer_id)
    data = request.get_json()

    if not data:
        return jsonify({"error": "No input provided"}), 400

    # Input validation
    if data.get('rating') and (data['rating'] < 0 or data['rating'] > 5):
        return jsonify({"error": "Rating must be between 0 and 5"}), 400
    if data.get('projects') and data['projects'] < 0:
        return jsonify({"error": "Projects count cannot be negative"}), 400
    if data.get('years') and data['years'] < 0:
        return jsonify({"error": "Years of experience cannot be negative"}), 400

    try:
        designer.name = data.get('name', designer.name)
        designer.rating = data.get('rating', designer.rating)
        designer.description = data.get('description', designer.description)
        designer.projects = data.get('projects', designer.projects)
        designer.years = data.get('years', designer.years)
        designer.price = data.get('price', designer.price)
        designer.phone1 = data.get('phone1', designer.phone1)
        designer.phone2 = data.get('phone2', designer.phone2)
        designer.isShortlisted = data.get('isShortlisted', designer.isShortlisted)
        designer.isHidden = data.get('isHidden', designer.isHidden)

        db.session.commit()
        return jsonify({"message": "Designer updated", "designer": designer.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/listings/<int:designer_id>', methods=['DELETE'])
def delete_designer(designer_id):
    """Delete a designer"""
    designer = Designer.query.get_or_404(designer_id)
    try:
        db.session.delete(designer)
        db.session.commit()
        return jsonify({"message": f"Designer {designer_id} deleted successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Static file serving
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static_files(path):
    return send_from_directory('.', path)

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)