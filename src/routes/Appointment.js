/* eslint-disable object-curly-spacing */
/* eslint-disable new-cap */
const controller = require("../controllers/Appointment");
const router = express.Router();

router.post("/create/", controller.createAppointment);
router.get("/get/:appointmentId", controller.readAppointment);
router.get("/get/", controller.readAllAppointments);
router.patch("/update/:appointmentId", controller.updateAppointment);
router.delete("/delete/:appointmentId", controller.deleteAppointment);

module.exports = router;
