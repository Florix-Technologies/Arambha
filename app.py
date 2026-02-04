# Flask backend for ecommerce project (Firestore only)
from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)
CORS(app)

# Initialize Firebase Admin SDK
cred = credentials.Certificate('key.json')
firebase_admin.initialize_app(cred)

# Initialize Firestore client
db = firestore.client()




# FINAL RESTFUL API ENDPOINTS
# Top-level collections: furniture, interiors
# Categories: subcollection 'categories' under each collection
# Products: subcollection 'products' under each category

# CATEGORY CRUD
@app.route('/<collection>/categories', methods=['POST'])
def create_category(collection):
    data = request.json
    if not data or 'name' not in data:
        return jsonify({'error': 'Category name required'}), 400
    # Create a new category in the 'categories' subcollection under the top-level collection
    cat_ref = db.collection(collection).document()  # category document
    cat_ref.set({
        'name': data['name'],
        'slug': data['name'].lower().replace(' ', '-'),
        'createdAt': firestore.SERVER_TIMESTAMP
    })
    return jsonify({'category_id': cat_ref.id}), 201

@app.route('/<collection>/categories', methods=['GET'])
def get_all_categories(collection):
    # Get all category documents under the top-level collection
    cats_ref = db.collection(collection).stream()
    result = []
    for doc in cats_ref:
        # Exclude any non-category docs if needed (optional: add a type field to filter)
        item = doc.to_dict()
        item['category_id'] = doc.id
        result.append(item)
    return jsonify(result)

@app.route('/<collection>/categories/<category_id>', methods=['PUT'])
def update_category(collection, category_id):
    data = request.json
    doc_ref = db.collection(collection).document(category_id)
    update_data = {}
    if data.get('name'):
        update_data['name'] = data['name']
        update_data['slug'] = data['name'].lower().replace(' ', '-')
    if update_data:
        update_data['updatedAt'] = firestore.SERVER_TIMESTAMP
        doc_ref.update(update_data)
    return jsonify({'message': 'Category updated'}), 200

@app.route('/<collection>/categories/<category_id>', methods=['DELETE'])
def delete_category(collection, category_id):
    # Delete all products under this category
    products_ref = db.collection(collection).document(category_id).collection('products').stream()
    for prod in products_ref:
        prod.reference.delete()
    # Delete the category document
    db.collection(collection).document(category_id).delete()
    return jsonify({'message': 'Category and its products deleted'}), 200
    prods_ref = db.collection(collection).collection('categories').document(category_id).collection('products').stream()
    for prod in prods_ref:
        prod.reference.delete()
    # Delete the category itself
    db.collection(collection).collection('categories').document(category_id).delete()
    return jsonify({'message': 'Category and products deleted'}), 200

# PRODUCT CRUD
@app.route('/<collection>/categories/<category_id>/products', methods=['POST'])
def add_product(collection, category_id):
    data = request.json
    if not data or 'name' not in data:
        return jsonify({'error': 'Product name required'}), 400
    doc_ref = db.collection(collection).document(category_id).collection('products').document()
    doc_ref.set({
        'name': data['name'],
        'description': data.get('description', ''),
        'imageUrl': data.get('imageUrl', ''),
        'createdAt': firestore.SERVER_TIMESTAMP
    })
    return jsonify({'product_id': doc_ref.id}), 201

@app.route('/<collection>/categories/<category_id>/products', methods=['GET'])
def get_products(collection, category_id):
    prods_ref = db.collection(collection).document(category_id).collection('products').stream()
    result = []
    for doc in prods_ref:
        item = doc.to_dict()
        item['product_id'] = doc.id
        result.append(item)
    return jsonify(result)

@app.route('/<collection>/categories/<category_id>/products/<product_id>', methods=['PUT'])
def update_product(collection, category_id, product_id):
    data = request.json
    doc_ref = db.collection(collection).document(category_id).collection('products').document(product_id)
    doc_ref.update({
        'name': data.get('name', ''),
        'description': data.get('description', ''),
        'imageUrl': data.get('imageUrl', ''),
        'createdAt': firestore.SERVER_TIMESTAMP
    })
    return jsonify({'message': 'Product updated'}), 200

@app.route('/<collection>/categories/<category_id>/products/<product_id>', methods=['DELETE'])
def delete_product(collection, category_id, product_id):
    db.collection(collection).collection('categories').document(category_id).collection('products').document(product_id).delete()
    return jsonify({'message': 'Product deleted'}), 200

if __name__ == '__main__':
    app.run(debug=True)
