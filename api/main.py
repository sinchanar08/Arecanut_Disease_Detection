from fastapi import FastAPI,File,UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf


# Create a FastAPI instance
app = FastAPI()

origins=[
    "https://localhost",
    "https://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins="http://localhost:3000",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
MODEL = tf.keras.models.load_model("../saved_models/1.keras",compile=False)


CLASS_NAMES = ['Healthy_Leaf',
 'Healthy_Nut',
 'Healthy_Trunk',
 'Stem_bleeding',
 'bud borer',
 'healthy_foot',
 'stem cracking',
 'yellow leaf disease']

# Define a simple GET endpoint
@app.get("/ping")
async def ping():
    return {"message": "Hello, I am alive!"}
def read_file_as_image(data) -> np.ndarray:
    image=np.array(Image.open(BytesIO(data)))
    return image


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image = read_file_as_image(await file.read())
        img_batch = np.expand_dims(image, 0)
        predictions = MODEL.predict(img_batch)
        predicted_class = CLASS_NAMES[np.argmax(predictions[0])]
        confidence = np.max(predictions[0])
        return {'Class': predicted_class, 'Confidence': float(confidence)}
    except Exception as e:
        return {"error": str(e)}
    pass

# Run the application
if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)

