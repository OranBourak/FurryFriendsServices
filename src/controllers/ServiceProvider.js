
const mongoose = require("mongoose");
const ServiceProvider = require("../models/ServiceProvider");

// GET CONTROLLERS
const readServiceProvider = async (req, res) => {
    const serviceProviderId = req.params.serviceProviderId;

    try {
        const serviceProvider = await ServiceProvider.findById(serviceProviderId);
        return serviceProvider ?
            res.status(200).json({serviceProvider}) :
            res.status(404).json({message: "ServiceProvider not found"});
    } catch (error) {
        return res.status(500).json({error});
    }
};
const readAllServiceProviders = async (_, res) => {
    try {
        const serviceProviders = await ServiceProvider.find({});
        return res.status(200).json({serviceProviders});
    } catch (error) {
        return res.status(500).json({error});
    }
};

// POST CONTROLLERS
const createServiceProvider = async (req, res) => {
    const {provider} = req.body;
    const serviceProvider = new ServiceProvider({
        _id: new mongoose.Types.ObjectId(),
        provider,
    });

    try {
        await serviceProvider.save();
        return res.status(201).json({serviceProvider});
    } catch (error) {
        return res.status(500).json({error});
    }
};

// PATCH CONTROLLERS
const updateServiceProvider = async (req, res) => {
    const serviceProviderId = req.params.serviceProviderId;
    try {
        // finding the serviceProvider by id
        const serviceProvider = await ServiceProvider.findById(serviceProviderId);
        if (serviceProvider) {
            try {
                serviceProvider.set(req.body);
                await serviceProvider.save();
                return res.status(201).json({serviceProvider});
            } catch (error) {
                res.status(500).json({error});
            }
        } else {
            res.status(404).json({message: "ServiceProvider not found"});
        }
    } catch (error) {
        res.status(500).json({error});
    }
};

// DELETE CONTROLLERS
const deleteServiceProvider = async (req, res) => {
    const serviceProviderId = req.params.serviceProviderId;

    try {
        await ServiceProvider.findByIdAndDelete(serviceProviderId);
        return res.status(201).json({
            message: serviceProviderId + "Deleted from database!",
        });
    } catch (error) {
        return res.status(500).json({message: "ServiceProvider not found"});
    }
};

module.exports = {
    createServiceProvider,
    readServiceProvider,
    readAllServiceProviders,
    updateServiceProvider,
    deleteServiceProvider,
};
