import Booking from "../models/Booking.js"
import Car from "../models/Car.js";


// Fuction to Check Availability of Car for a given Date
const checkAvailability = async (car, pickupDate, returnDate)=>{
    const bookings = await Booking.find({
        car,
        pickupDate: {$lte: returnDate},
        returnDate: {$gte: pickupDate},
    })
    return bookings.length === 0; 
}

// API to Check Availability of Cars for the given Date and Location
export const checkAvailabilityOfCar = async (req, res)=>{
    try {
        const {location, pickupDate, returnDate} = req.body

        // Fetch all available cars for the given location
        const cars = await Car.find({location, isAvaliable: true})

        // check car availability for the given date range using promise
        const availableCarsPromises = cars.map(async (car)=>{
            const isAvaliable = await checkAvailability(car._id, pickupDate, returnDate)
            return {...car._doc, isAvaliable: isAvaliable}
        })

        let availableCars = await Promise.all(availableCarsPromises);
        availableCars = availableCars.filter(car => car.isAvaliable === true)

        res.json({success: true, availableCars})
        
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

// API to Create Bookings
export const createBooking = async (req, res)=>{
    try {
        const {_id} = req.user;
        const {car, pickupDate, returnDate} = req.body;

        const isAvaliable = await checkAvailability(car, pickupDate, returnDate)
        if(!isAvaliable){
            return res.json({success: false, message: "Car is not Available"})
        }

        const carData = await Car.findById(car)

        // Calculate price based on pickupDate and returnDate
        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);
        const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24))
        const price = carData.pricePerDay * noOfDays;

        await Booking.create({car, owner: carData.owner, user: _id, pickupDate, returnDate, price})

        res.json({success: true, message: "Booking Created"})
        
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

export const getUserBookings = async (req,res)=>{
    try {
        const {_id} = req.user;
        const bookings = await Booking.find({user: _id}).populate("car").sort
        ({createdAt: -1})
        res.json({success: true, bookings})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}