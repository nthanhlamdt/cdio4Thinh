const bcrypt = require('bcrypt');

async function testPassword() {
    const plainPassword = '123456';
    const hashedPassword = '$2b$10$rQZ8Kj9XzYwLmNpQrStUuO1vBcDeFgHiJkLmNoPqRsTuVwXyZaBcD';
    
    console.log('Testing password...');
    console.log('Plain password:', plainPassword);
    console.log('Hashed password:', hashedPassword);
    
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('Password is valid:', isValid);
    
    // Tạo hash mới
    const newHash = await bcrypt.hash(plainPassword, 10);
    console.log('New hash for 123456:', newHash);
}

testPassword();
