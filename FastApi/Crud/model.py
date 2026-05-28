from pydantic import BaseModel


class ProductModel(BaseModel):
    id :int
    name:str
    description:str
    price:int
    quantity:int
    
    # def __init__(self,id:int,name:str,description:str,price:int,quantity:int):
    #     self.id=id
    #     self.name=name
    #     self.description=description
    #     self.price=price
    #     self.quantity=quantity
    