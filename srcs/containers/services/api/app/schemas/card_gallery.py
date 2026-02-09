from app.extensions import ma, db
from app.models.card_gallery import CardGallery
from marshmallow import fields, Schema

class CardGallerySchema(ma.SQLAlchemyAutoSchema):
	user_id = fields.Integer(required=True)
	img_url = fields.String(required=True)

	class Meta:
		model = CardGallery
		load_instance = True
		sqla_session = db.session

card_gallery_schema = CardGallerySchema()
