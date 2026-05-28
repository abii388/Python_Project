from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import database_models
from database_models import Product  # This is your SQLAlchemy model
from model import ProductModel       # This is your Pydantic model

app = FastAPI()

# Creates the tables in the DB if they don't exist
database_models.Base.metadata.create_all(bind=engine)

# Dependency to get the DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/create")
def create_product(product: ProductModel, db: Session = Depends(get_db)):

    db_product = Product(**product.model_dump())
    
    db.add(db_product)
    db.commit()
    db.refresh(db_product)  
    
    return {"message": "Product created successfully", "id": db_product.id}
  
@app.get("/products")
def get_all_product(db: Session = Depends(get_db)):
    
    products=db.query(Product).all()
    return products

@app.get("/product/{id}")
def view_product(id:int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == id).first()
    if product:
        return product
    return {"message": "Product not found"}
@app.put("/update/{id}")
def update(id:int,product:ProductModel,db:Session=Depends(get_db)):
    product_data=db.query(Product).filter(Product.id==id).first()
    if product_data:
        product_data.name=product.name
        product_data.description=product.description
        product_data.price=product.price
        product_data.quantity=product.quantity
        db.commit()
        return {"message":"Product updated successfully"}

@app.delete("/delete/{id}")
def delete_data(id:int,db:Session=Depends(get_db)   ):
    product_data=db.query(Product).filter(Product.id==id).first()
    if product_data:
        db.delete(product_data)
        db.commit()
        return {"message":"Product deleted successfully"}
        
        
        


# from fastapi import FastAPI
# from model import ProductModel
# from  database import SessionLocal,engine
# import database_models
# from database_models import Base,Product
# from sqlalchemy.orm import Session
# from fastapi import Depends
# app=FastAPI()
# database_models.Base.metadata.create_all(bind=engine)
# db=SessionLocal()





# @app.post("/create")
# def create_product(product:ProductModel,db,):
#     db_product=Product(**product.model_dump())
#     db.add(db_product)
#     db.commit()
#     db.refresh(db_product)
#     return {"message":"Product created successfully","id":db_product.id}