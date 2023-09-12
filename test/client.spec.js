const chai = require("chai");
const {expect} = chai;
const sinon = require("sinon"); // for mocking dependencies

const clientController = require("../src/controllers/Client.js");
const Client = require("../src/models/Client.js");



describe("Controller", () => {
    afterEach(() => {
        sinon.restore();
    })
    describe("readClient", () => {
        it("should return a 404 status and a message if client is not found", async () => {
            // Mock the ServiceProvider.findById() function to return null to simulate a not found scenario.
            const findOneStub = sinon.stub(Client, "findOne").resolves(null);

            const req = {params: {clientId: "nonexistent_id"}};
            const res = {status: sinon.stub().returnsThis(), json: sinon.stub()};

            await clientController.readClient(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith({err: "Client not found"})).to.be.true;

        });

        it("should return a 200 status and the client JSON if found", async () => {
            // Create a mock serviceProvider object for testing.
            const clientData = {
                    "_id": "valid_id"
                };

            // Mock the ServiceProvider.findById() function to return the mock serviceProvider object.
            const findOneStub = sinon.stub(Client, "findOne").resolves(clientData);

            const req = {params: {clientId: clientData._id}};
            const res = {status: sinon.stub().returnsThis(), json: sinon.stub()};

            await clientController.readClient(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({client: clientData})).to.be.true;

        });

        it("should return a 500 status if there is an internal server error", async () => {
            // Mock the client.findById() function to throw an error to simulate an internal server error.
            const error = new Error("Internal Server Error");
            const findOneStub = sinon.stub(Client, "findOne").rejects(error);

            const req = {params: {clientId: "64fbaf0b8c91f5d9c14bff36"}};
            const res = {status: sinon.stub().returnsThis(), json: sinon.stub()};

            await clientController.readClient(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith({message: error.message})).to.be.true;

        });
    });
    // Add more test cases for other controller functions as needed
});


