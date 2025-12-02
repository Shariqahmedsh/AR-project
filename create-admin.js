import bcrypt from "bcryptjs";
import prisma from "../prisma/client.js";

const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "admin" }
    });

    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin.username);
      return;
    }

    // Create admin user
    const adminUsername = "admin";
    const adminEmail = "admin@arcyberguard.com";
    const adminPassword = "AdminSecure123!";
    const adminPhone = "9999999999";
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        username: adminUsername,
        email: adminEmail,
        phoneNumber: adminPhone,
        password: hashedPassword,
        name: "System Administrator",
        role: "admin",
        isPhoneVerified: true // Admin doesn't need phone verification
      }
    });

    console.log("Admin user created successfully!");
    console.log("Username:", adminUsername);
    console.log("Email:", adminEmail);
    console.log("Phone:", adminPhone);
    console.log("Password:", adminPassword);
    console.log("Role:", admin.role);
    console.log("Phone Verified:", admin.isPhoneVerified);
    console.log("\nPlease change the default password after first login!");

  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
};

createAdmin();
