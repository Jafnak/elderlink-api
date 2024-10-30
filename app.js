const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const express = require("express")
const jwt = require("jsonwebtoken")
const cors = require("cors")

const nodemailer = require('nodemailer'); // Add this line at the top of your file
const bodyParser = require('body-parser');

require('dotenv').config(); 

const { userModel } = require("./models/user")
const { adminModel } = require("./models/admin")
const { caretakerModel } = require("./models/caretaker")
const { driverModel } = require("./models/driver")
const { doctorModel } = require("./models/doctor")
const { Appointment } = require("./models/appointment")
const { bookModel } = require("./models/book")
const feedbackModel = require("./models/feedback")



const app = express()
app.use(cors())
app.use(express.json())
app.use(bodyParser.json());


mongoose.connect("mongodb+srv://Jafna02:jafna9074@cluster0.icijy.mongodb.net/ElderlinkDb?retryWrites=true&w=majority&appName=Cluster0")

const generateHashedPassword = async (password) => {
    const salt = await bcrypt.genSalt(10)  //salt=cost factor value
    return bcrypt.hash(password, salt)
}

//---------------------USER SIGNUP----------------------------------------------------------------

app.post("/usersignup", async (req, res) => {

    let input = req.body
    let hashedPassword = await generateHashedPassword(input.password)
    //console.log(hashedPassword)

    input.password = hashedPassword     //stored the hashed password to server
    let user = new userModel(input)
    user.save()
    //console.log(user)
    res.json({ "status": "success" })
})
//--------------------------------USER VIEW-------------------------------
app.post("/userview", (req, res) => {
    const { name, emailid } = req.body;

    // Create a filter object based on search inputs
    let filter = {};
    if (name) filter.name = { $regex: name, $options: "i" }; // Case-insensitive search for name
    if (emailid) filter.emailid = { $regex: emailid, $options: "i" }; // Case-insensitive search for email

    userModel.find(filter)
        .then((data) => {
            res.json(data);
        })
        .catch((error) => {
            res.json(error);
        });
});



app.delete("/deleteuser/:id", (req, res) => {
    const userId = req.params.id;

    userModel.findByIdAndDelete(userId)
        .then(() => {
            res.json({ status: "success" });
        })
        .catch((error) => {
            res.json({ status: "error", error });
        });
});

//----------------------BOOKING DOCTOR--------------------------------------------
// Route to book a service
app.post("/bookingdoctor", async (req, res) => {
    const { emailid, services, name, date, time } = req.body;

    try {
        // Check if the provider is already booked for the same date and time
        const existingBooking = await bookModel.findOne({ services, name, date, time });

        if (existingBooking) {
            return res.json({ status: 'error', message: 'Service provider already booked for this time slot. Please choose a different time or service provider.' });
        } else {
            // Create a new booking
            let book = new bookModel({ emailid, services, name, date, time });
            await book.save();
            res.json({ status: 'success', message: 'Successfully booked' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// Route to view all bookings
app.get("/viewbooking", (req, res) => {
    bookModel.find()
        .then((data) => res.json(data))
        .catch((error) => {
            console.error(error);
            res.status(500).json({ status: 'error', message: 'Server error' });
        });
});

// Route to delete a booking by email and service
app.delete('/deletebooking/:emailid/:service', async (req, res) => {
    const { emailid, services } = req.params;

    try {
        const result = await bookModel.deleteOne({ emailid, services: services });
        if (result.deletedCount > 0) {
            res.status(200).json({ status: 'success', message: 'Booking deleted successfully' });
        } else {
            res.status(404).json({ status: 'error', message: 'Booking not found for this service' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

app.get("/doctors", async (req, res) => {
    try {
        const doctors = await doctorModel.find(); // Fetch all doctors from your database
        res.json(doctors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


app.post('/searchbooking', (req, res) => {
    const { emailid, date } = req.body;
  
    // Debugging: Log the incoming request
   // console.log('Search query:', { emailid, date });
  
    if (!emailid || !date) {
      return res.status(400).json({ message: "Both emailid and date are required." });
    }
  
    bookModel.find({ emailid, date })
      .then(appointments => {
        if (appointments.length > 0) {
         // console.log('Appointments found:', appointments);
          res.json(appointments);
        } else {
          console.log('No appointments found for the given email and date.');
          res.json([]);  // Return empty array if no bookings found
        }
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
      });
  });
  


  //-------------------DRIVER--------------------------

  // Define your booking schema
const bookingSchema = new mongoose.Schema({
    emailid: { type: String, required: true },
    services: { type: String, required: true },
    name: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true }, // Include location in your schema
});
  const Booking = mongoose.model('Booking', bookingSchema);

  // Endpoint to submit location
  app.post('/submitLocation', (req, res) => {
      const { location } = req.body;
  
      if (!location) {
          return res.status(400).json({ status: "error", message: "Location is required." });
      }
  
      // Query for bookings based on the user's location (you can customize this as needed)
      Booking.findOne({ /* Add conditions based on your logic */ })
          .then(booking => {
              if (booking) {
                  // Example response with booking details
                  res.json({
                      status: "success",
                      bookingDetails: `Booking for ${booking.emailid} on ${booking.date} at ${booking.time}`,
                  });
              } else {
                  res.json({ status: "error", message: "No bookings found for this location." });
              }
          })
          .catch(err => {
              console.error(err);
              res.status(500).json({ status: "error", message: "Server error." });
          });
  });
  
  
//----------------------------------USER SIGN IN-----------------------------------

app.post("/usersignin", (req, res) => {
    let input = req.body;

    // Check if the role exists in the request
    if (!input.role) {
        return res.json({ "status": "role not specified" });
    }

    // Select the appropriate model based on the user's role
    let model;
    switch (input.role) {
        case 'user':
            model = userModel;
            break;
        case 'doctor':
            model = doctorModel;
            break;
        case 'driver':
            model = driverModel;
            break;
        case 'caretaker':
            model = caretakerModel;
            break;
        default:
            return res.json({ "status": "invalid role" });
    }

    // Perform login based on the selected model
    model.findOne({ emailid: input.emailid })
        .then((user) => {
            if (user) {
                // Define static passwords for roles
                const staticPasswords = {
                    doctor: "doctor988",
                    driver: "driver988",
                    caretaker: "caretaker988",
                };

                // Check if the role matches the user's role
                if (input.role in staticPasswords) {
                    // If the user role is one of the static roles, check against the static password
                    if (input.password === staticPasswords[input.role]) {
                        // If login is successful, generate a token
                        jwt.sign({ emailid: user.emailid, role: user.role }, "elder-app", { expiresIn: "1d" },
                            (error, token) => {
                                if (error) {
                                    res.json({ "status": "unable to create token" });
                                } else {
                                    res.json({ "status": "success", "userid": user._id, "token": token });
                                }
                            }
                        );
                    } else {
                        res.json({ "status": "incorrect password" });
                    }
                } else {
                    // For users without a static password (dynamic password check)
                    let dbPassword = user.password; // Get the hashed password from the database

                    // Compare input password with the hashed password
                    bcrypt.compare(input.password, dbPassword, (error, isMatch) => {
                        if (isMatch) {
                            // If login is successful, generate a token
                            jwt.sign({ emailid: user.emailid, role: user.role }, "elder-app", { expiresIn: "1d" },
                                (error, token) => {
                                    if (error) {
                                        res.json({ "status": "unable to create token" });
                                    } else {
                                        res.json({ "status": "success", "userid": user._id, "token": token });
                                    }
                                }
                            );
                        } else {
                            res.json({ "status": "incorrect password" });
                        }
                    });
                }
            } else {
                res.json({ "status": "user not found" });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ "status": "error", "message": "Internal Server Error" });
        });
});



//----------------------------ADMIN LOGIN----------------------------------------------

app.post("/adminlogin", (req, res) => {
    let input = req.body;

    // Default admin credentials
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin123';

    // Check if the input matches admin credentials
    if (input.emailid === adminEmail && input.password === adminPassword) {
        // Admin login successful
        jwt.sign({ emailid: input.emailid }, "elder-app", { expiresIn: "1d" }, (error, token) => {
            if (error) {
                res.json({ "status": "Token credentials failed" });
            } else {
                res.json({ "status": "success", "token": token, "message": "Admin logged in successfully" });
            }
        });
    } else {
        // Check if the user exists in the database
        adminModel.find({ name: input.emailid }).then((response) => {
            if (response.length > 0) {
                const validator = bcrypt.compareSync(input.password, response[0].password);
                if (validator) {
                    // User login successful
                    jwt.sign({ emailid: input.emailid}, "elder-app", { expiresIn: "1d" }, (error, token) => {
                        if (error) {
                            res.json({ "status": "Token credentials failed" });
                        } else {
                            res.json({ "status": "success", "token": token });
                        }
                    });
                } else {
                    res.json({ "status": "Wrong password" });
                }
            } else {
                res.json({ "status": "Username doesn't exist" });
            }
        }).catch((err) => {
            res.json({ "status": "Error occurred", "error": err.message });
        });
    }
});



//-------------------------------ADD CARETAKER------------------------------------------
app.post("/addcaretaker",(req,res)=>{
    let input=req.body
    let caretaker = new caretakerModel(input)
    caretaker.save()
    res.json({"status":"success"})
})
//-----------------care personal--------------------
app.get("/searchcaretaker", async (req, res) => {
    const { name, role } = req.query;

    try {
        const caretakers = await caretakerModel.find({ name: { $regex: name, $options: 'i' }, role });
        res.json(caretakers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


//-----------------------------------VIEW CARETAKERS---------------------------------------
app.post("/caretakerview", (req, res) => {
    const { searchQuery ,roleQuery} = req.body;
    
    const query = {};
    
    if (searchQuery) {
        query.name = { $regex: new RegExp(searchQuery, 'i') };  // Case-insensitive search by name
    }
  // Case-insensitive search for specialization
  if (roleQuery) {
    query.role = { $regex: new RegExp(roleQuery, 'i') };
  }
    caretakerModel.find(query)
        .then(data => {
            res.json(data);
        })
        .catch(error => {
            res.status(500).json({ message: "Error fetching caretaker data", error });
        });
});

// Delete a caretaker by emailid
app.delete("/deletecaretaker/:emailid", (req, res) => {
    const emailid = req.params.emailid;
    
    caretakerModel.findOneAndDelete({ emailid })
        .then(() => {
            res.json({ message: "Caretaker deleted successfully" });
        })
        .catch(error => {
            res.status(500).json({ message: "Error deleting caretaker", error });
        });
});
//------------------------------------ADD DRIVERS--------------------------------------------
app.post("/adddriver",(req,res)=>{
    let input=req.body
    let driver = new driverModel(input)
    driver.save()
    res.json({"status":"success"})
})
//--------------------------------VIEW DRIVERS--------------------------------------------------
app.post("/driverview",(req,res)=>{
    driverModel.find().then(
        (data)=>{
            res.json(data)
        }
    ).catch(
        (error)=>{
            res.json(error)
        }
    )
})


//------------------------------------ADD DOCTORS--------------------------------------------
app.post("/adddoctor", (req, res) => {
    const input = req.body;
    const doctor = new doctorModel(input);
    
    doctor.save()
      .then(() => res.json({ status: "success" }))
      .catch(error => res.status(500).json({ message: "Error adding doctor", error: error.message }));
  });
  
//--------------------------------VIEW DOCTOR--------------------------------------------------
// Doctor View Route
app.post("/doctorview", (req, res) => {
    const { searchQuery, specializationQuery } = req.body;
    
    const query = {};
  
    // Case-insensitive search for name
    if (searchQuery) {
      query.name = { $regex: new RegExp(searchQuery, 'i') };
    }
  
    // Case-insensitive search for specialization
    if (specializationQuery) {
      query.specialization = { $regex: new RegExp(specializationQuery, 'i') };
    }
  
    // Fetch doctors based on query
    doctorModel.find(query)
      .then(doctors => {
        //console.log(doctors);  // Debugging: Check if emailid exists in the response
        const doctorData = doctors.map(doctor => ({
          _id: doctor._id,
          name: doctor.name,
          specialization: doctor.specialization,
          location: doctor.location,
          phone: doctor.phone,
          emailid: doctor.emailid,  // Ensure emailid is included
          date: doctor.date,
          time: doctor.time
        }));
        res.json(doctorData);
      })
      .catch(error => res.status(500).json({ message: "Error fetching doctor data", error }));
  });
  
  // Route to delete a doctor by emailid
  app.delete("/deletedoctor/:emailid", (req, res) => {
    const emailid = req.params.emailid;
    
    doctorModel.findOneAndDelete({ emailid: emailid })
      .then(() => res.status(200).json({ message: "Doctor deleted successfully" }))
      .catch(error => res.status(500).json({ message: "Error deleting doctor", error }));
  });
  
// app.post("/book-appointment", (req, res) => {
//   const { doctorName, date, time, userEmail } = req.body;
  
//   const newAppointment = new Appointment({
//     doctorName,
//     date,
//     time,
//     userEmail
//   });

//   newAppointment.save()
//     .then(() => userModel.findOne({ emailid: userEmail }))
//     .then(user => {
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
//       res.status(200).json({
//         message: "Appointment booked successfully!",
//         userDetails: {
//           name: user.name,
//           phone: user.phone,
//           address: user.address,
//           gender: user.gender,
//           age: user.age,
//           guardian: user.gardian,
//           guardianEmail: user.gardemail
//         }
//       });
//     })
//     .catch(error => res.status(500).json({ message: "Error booking appointment", error: error.message }));
// });



//-------------AVAILABILITY--------------



//---------------------BOOK APPOINT-----------------------------



//-------------------------------EMAIL----------------------------------

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your email stored in environment variables
        pass: process.env.EMAIL_PASS  // Your email password or app-specific password stored in environment variables
    }
});

app.post('/send-alert', (req, res) => {
    const { email, alertMessage } = req.body;

    const mailOptions = {
        from: process.env.EMAIL_USER, // The sender email from environment variable
        to: email,
        subject: 'Emergency Alert from ElderLink App',
        text: alertMessage
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Email sending error:", error); // Log the error for debugging
            return res.status(500).send(error.toString());
        }
        res.status(200).send('Alert sent: ' + info.response);
    });
    
});



//---------------------FEEDBACK-------------------------
app.post('/submitFeedback', async (req, res) => {
    try {
        const { email, message } = req.body;

        if (!email || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newFeedback = new feedbackModel({
            email,
            message
        });

        await newFeedback.save();
        res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (err) {
        console.error('Error submitting feedback:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Route to get all feedbacks
app.get('/getFeedbacks', async (req, res) => {
    try {
        const feedbacks = await feedbackModel.find();
        res.status(200).json(feedbacks);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching feedbacks' });
    }
});

// Route to delete a feedback by ID
app.delete('/deleteFeedback/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await feedbackModel.findByIdAndDelete(id);
        res.status(200).json({ message: 'Feedback deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting feedback' });
    }
});





// -------------PROFILE--------------------
app.get('/profile/:emailid', async (req, res) => {
    console.log('Received request for profile email:', req.params.emailid); // Debug log
    try {
        const user = await userModel.findOne({ emailid: req.params.emailid }); // Corrected here
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        console.error('Error fetching user:', err); // Added error log
        res.status(400).json({ error: err.message });
    }
});


app.get('/userprofile', async (req, res) => {
    try {
        const profiles = await userModel.find();
        res.json(profiles);
    } catch (err) {
        console.error('Error fetching profiles:', err); // Added error log
        res.status(500).json({ message: 'Server error' });
    }
});



app.post('/doctor/bookings', async (req, res) => {
    const { emailid } = req.body; // Extract the email ID from the request body
    try {
        const bookings = await bookModel.find({ emailid }); // Fetch bookings associated with the plumber's email
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});
  



app.listen(8080, () => {
    console.log("server started")
})