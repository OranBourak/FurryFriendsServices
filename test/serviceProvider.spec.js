const chai = require("chai");
const {expect} = chai;
const sinon = require("sinon"); // for mocking dependencies

// Import your controller functions and any necessary dependencies
const ServiceProviderController = require("../src/controllers/ServiceProvider");
const ServiceProvider = require("../src/models/ServiceProvider"); // Replace with your actual ServiceProvider model import

describe("ServiceProvider Controller", () => {
    describe("readServiceProvider", () => {
        it("should return a 404 status and a message if serviceProvider is not found", async () => {
            // Mock the ServiceProvider.findById() function to return null to simulate a not found scenario.
            const findByIdStub = sinon.stub(ServiceProvider, "findById").resolves(null);

            const req = {params: {serviceProviderId: "nonexistent_id"}};
            const res = {status: sinon.stub().returnsThis(), json: sinon.stub()};

            await ServiceProviderController.readServiceProvider(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith({message: "ServiceProvider not found"})).to.be.true;

            findByIdStub.restore();
        });

        it("should return a 200 status and the serviceProvider JSON if found", async () => {
            // Create a mock serviceProvider object for testing.
            const serviceProviderData = {
                _id: "valid_id",
                // Other properties...
            };

            // Mock the ServiceProvider.findById() function to return the mock serviceProvider object.
            const findByIdStub = sinon.stub(ServiceProvider, "findById").resolves(serviceProviderData);

            const req = {params: {serviceProviderId: "valid_id"}};
            const res = {status: sinon.stub().returnsThis(), json: sinon.stub()};

            await ServiceProviderController.readServiceProvider(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({serviceProvider: serviceProviderData})).to.be.true;

            findByIdStub.restore();
        });

        it("should return a 500 status if there is an internal server error", async () => {
            // Mock the ServiceProvider.findById() function to throw an error to simulate an internal server error.
            const error = new Error("Internal Server Error");
            const findByIdStub = sinon.stub(ServiceProvider, "findById").rejects(error);

            const req = {params: {serviceProviderId: "valid_id"}};
            const res = {status: sinon.stub().returnsThis(), json: sinon.stub()};

            await ServiceProviderController.readServiceProvider(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith({error: error.message})).to.be.true;

            findByIdStub.restore();
        });
    });

    // Add more test cases for other controller functions as needed
});
