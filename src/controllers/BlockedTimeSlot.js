const mongoose = require("mongoose");
const BlockedTimeSlot = require("../models/BlockedTimeSlot");
const {ServiceProvider} = require("./ServiceProvider");
// const serviceProvider = require("../models/serviceProvider");


// GET CONTROLLERS
const readBlockedTimeSlot = async (req, res) => {
    const blockedTimeSlotId = req.params.blockedTimeSlotId;

    try {
        const blockedTimeSlot = await BlockedTimeSlot.findById(blockedTimeSlotId);
        return blockedTimeSlot ?
            res.status(200).json({blockedTimeSlot}) :
            res.status(404).json({message: "BlockedTimeSlot not found"});
    } catch (error) {
        return res.status(500).json({error});
    }
};
const readAllBlockedTimeSlots = async (_, res) => {
    try {
        const blockedTimeSlots = await BlockedTimeSlot.find({});
        return res.status(200).json({blockedTimeSlots});
    } catch (error) {
        return res.status(500).json({error});
    }
};

// POST CONTROLLERS
const createBlockedTimeSlot = async (req, res) => {
    const serviceProviderId = req.params.serviceProviderId;

    const {date, blockedHours} = req.body;
    // Start a new transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const serviceProvider = await ServiceProvider.findById(serviceProviderId);
        if (!serviceProvider) {
            return res.status(404).json({message: "Service Provider was not found"});
        }
        // create a new BlockedTimeSlot object
        const blockedTimeSlot = new BlockedTimeSlot({
            _id: new mongoose.Types.ObjectId(),
            date: date,
            blockedHours: blockedHours,
        });
        await blockedTimeSlot.save();

        // Add the new object id to the service provider blockedTimeSlots array
        serviceProvider.blockedTimeSlots.push(blockedTimeSlot._id);
        await serviceProvider.save();

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();
        // On transaction success
        return res.status(201).json({message: "Successful Transaction"});
    } catch (error) {
        // If any step fails, roll back the transaction
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({error});
    }
};

// PATCH CONTROLLERS
const updateBlockedTimeSlot = async (req, res) => {
    const blockedTimeSlotId = req.params.blockedTimeSlotId;
    try {
        // finding the blockedTimeSlot by id
        const blockedTimeSlot = await BlockedTimeSlot.findById(blockedTimeSlotId);
        if (blockedTimeSlot) {
            try {
                blockedTimeSlot.set(req.body);
                await blockedTimeSlot.save();
                return res.status(201).json({blockedTimeSlot});
            } catch (error) {
                res.status(500).json({error});
            }
        } else {
            res.status(404).json({message: "BlockedTimeSlot not found"});
        }
    } catch (error) {
        res.status(500).json({error});
    }
};

// DELETE CONTROLLERS
const deleteBlockedTimeSlot = async (req, res) => {
    const blockedTimeSlotId = req.params.blockedTimeSlotId;

    try {
        await BlockedTimeSlot.findByIdAndDelete(blockedTimeSlotId);
        return res.status(201).json({
            message: blockedTimeSlotId + "Deleted from database!",
        });
    } catch (error) {
        return res.status(500).json({message: "BlockedTimeSlot not found"});
    }
};

module.exports = {
    createBlockedTimeSlot,
    readBlockedTimeSlot,
    readAllBlockedTimeSlots,
    updateBlockedTimeSlot,
    deleteBlockedTimeSlot,
};
