/* eslint-disable comma-dangle */
/* eslint-disable operator-linebreak */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
const mongoose = require("mongoose");
const Client = require("../models/Client");

// GET CONTROLLERS
const readClient = async (req, res) => {
  const clientId = req.params.clientId;

  try {
    const client = await Client.findById(clientId);
    return client
      ? res.status(200).json({ client })
      : res.status(404).json({ message: "Client not found" });
  } catch (error) {
    return res.status(500).json({ error });
  }
};
const readAllClients = async (_, res) => {
  try {
    const clients = await Client.find({});
    return res.status(200).json({ clients });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

// POST CONTROLLERS
const createClient = async (req, res) => {
  const { data } = req.body;
  const client = new Client({
    _id: new mongoose.Types.ObjectId(),
    data,
  });

  try {
    await client.save();
    return res.status(201).json({ client });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

// PATCH CONTROLLERS
const updateClient = async (req, res) => {
  const clientId = req.params.clientId;
  try {
    // finding the client by id
    const client = await Client.findById(clientId);
    if (client) {
      try {
        client.set(req.body);
        await client.save();
        return res.status(201).json({ client });
      } catch (error) {
        res.status(500).json({ error });
      }
    } else {
      res.status(404).json({ message: "Client not found" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

// DELETE CONTROLLERS
const deleteClient = async (req, res) => {
  const clientId = req.params.clientId;

  try {
    await Client.findByIdAndDelete(clientId);
    return res.status(201).json({
      message: clientId + "Deleted from database!",
    });
  } catch (error) {
    return res.status(500).json({ message: "Client not found" });
  }
};

module.exports = {
  createClient,
  readClient,
  readAllClients,
  updateClient,
  deleteClient,
};
