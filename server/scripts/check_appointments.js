const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/book_doctor?retryWrites=false';

mongoose.connect(mongoUri)
  .then(async () => {
    const User = require('../models/User');
    const Appointment = require('../models/Appointment');

    const doctor = await User.findOne({ email: 'smith@example.com' });
    console.log('Doctor:', doctor.name, 'ID:', doctor._id);

    const appointments = await Appointment.find({ doctorId: doctor._id });
    console.log('Total Appointments:', appointments.length);
    for (const appt of appointments) {
      console.log('Date:', appt.appointmentDate);
      console.log('Time:', appt.appointmentTime);
      console.log('Status:', appt.status);
      console.log('-----------------');
    }

    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error:', err.message);
  });
