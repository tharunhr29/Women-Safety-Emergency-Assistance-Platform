const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const promoteUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const emailToPromote = 'tharunhrmys29@gmail.com';
    const user = await User.findOne({ email: emailToPromote });

    if (!user) {
      console.log(`User with email ${emailToPromote} not found.`);
    } else {
      user.role = 'admin';
      await user.save();
      console.log(`Successfully promoted ${emailToPromote} to admin!`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error promoting user:', error);
    process.exit(1);
  }
};

promoteUser();
