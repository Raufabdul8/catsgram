process.env.NODE_ENV = 'test'

const chai = require('chai');
const chaiHttp = require('chai-http');
const fs = require('fs');

const app = require('../app'); 
const { expect } = chai;
chai.use(chaiHttp);

describe('Image Routes', () => {

  let testImage;

  describe('POST /', () => {
    it('should upload an image successfully', async () => {
      const imagePath = 'uploads/test.jpg';
      const testUploadImage = fs.readFileSync(imagePath);

      const res = await chai
        .request(app)
        .post('/images')
        .attach('image', testUploadImage, 'test-image.jpg')
        .field('metadata', JSON.stringify({ key: 'value' })); 
      expect(res).to.have.status(201);
      expect(res.body).to.have.property('message', 'Image uploaded successfully');
      expect(res.body).to.have.property('image');

      testImage = res.body.image;
    });

    it('should handle no file uploaded', async () => {
      const res = await chai.request(app).post('/images');

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('error', 'No file uploaded');
    });
  });

  describe('GET /', () => {
    it('should retrieve a list of images', async () => {
      const res = await chai.request(app).get('/images');

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
    });
  });

  describe('PUT /:id', () => {

    it('should update an image successfully', async () => {
      const imagePath = testImage.imageUrl;
      const testUploadImage = fs.readFileSync(imagePath);

      const res = await chai
        .request(app)
        .put(`/images/${testImage._id}`)
        .attach('image', testUploadImage, 'updated-image.jpg')
        .field('metadata', JSON.stringify({ newKey: 'newValue' })); 


      expect(res).to.have.status(200);
      expect(res.body).to.have.property('message', 'Image and metadata updated successfully');
      expect(res.body).to.have.property('image');
    });
  });

  describe('DELETE /:id', () => {

    it('should delete an image successfully', async () => {
      const res = await chai.request(app).delete(`/images/${testImage._id}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('message', 'Image deleted successfully');
    });

    it('should handle deleting a non-existent image', async () => {
      const res = await chai.request(app).delete(`/images/${testImage._id}`);
      expect(res).to.have.status(404);
      expect(res.body).to.have.property('error', 'Image not found');
    });
  });

});



