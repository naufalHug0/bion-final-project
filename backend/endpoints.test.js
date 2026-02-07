import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Configuration ---
const BASE_URL = 'http://localhost:5001'; // Adjust port if needed
const TEST_IMAGE_PATH = './test.jpg';     // Make sure this file exists!

// Global variables to carry data between steps
const TEST_USER = {
    name: 'Fresh Student',
    email: 'test_student_fresh@test.com', 
    password: 'password123'
};

let authToken = '';
let userId = '';
let productId = '';
let orderId = '';

// --- Helper Functions ---
const logStep = (step, msg) => console.log(`\n\x1b[36m[STEP ${step}]\x1b[0m ${msg}`);
const logSuccess = (msg) => console.log(`\x1b[32m  ✔ SUCCESS:\x1b[0m ${msg}`);
const logInfo = (msg) => console.log(`\x1b[33m  ℹ INFO:\x1b[0m ${msg}`);
const logError = (err) => {
    console.log(`\x1b[31m  ✖ FAILED:\x1b[0m ${err.message}`);
    if (err.response) {
        console.log(`     Status: ${err.response.status}`);
        console.log(`     Data:`, err.response.data);
    }
};

// Check if test image exists
if (!fs.existsSync(TEST_IMAGE_PATH)) {
    console.error(`\x1b[31m[ERROR] Please place a dummy image named 'test.jpg' in the root directory for upload tests.\x1b[0m`);
    process.exit(1);
}

// --- 0. RESET FUNCTION (The "Fresh" Start) ---
const resetEnvironment = async () => {
    console.log('--- Checking for stale data ---');
    try {
        // 1. Try to login to see if user exists
        const res = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: TEST_USER.email,
            password: TEST_USER.password
        });

        // 2. If login works, we have a stale user. Delete it.
        if (res.data.data.token) {
            const tempToken = res.data.data.token;
            logInfo('Found existing test user. Deleting to start fresh...');
            
            await axios.delete(`${BASE_URL}/api/auth/profile`, {
                headers: { Authorization: `Bearer ${tempToken}` }
            });
            logSuccess('Stale user deleted.');
        }
    } catch (error) {
        // If login fails (401/404), it means the user doesn't exist. That's good!
        if (error.response && (error.response.status === 401 || error.response.status === 404)) {
            logInfo('No stale user found. Environment is clean.');
        } else {
            console.error('Warning during cleanup:', error.message);
        }
    }
    console.log('-------------------------------\n');
};

// --- Main Test Flow ---
const runTests = async () => {

    console.log(`Starting API Tests on ${BASE_URL}...\n`);

    try {
        // 1. REGISTER USER (To get Token)
        logStep(1, 'Registering User... [/api/auth/register]');
        const uniqueEmail = `test_student_fresh@test.com`; // Random email to avoid duplicates
        const registerRes = await axios.post(`${BASE_URL}/api/auth/register`, {
            name: 'Test Student',
            email: uniqueEmail,
            password: 'password123'
        });
        authToken = registerRes.data.data.token;
        userId = registerRes.data.data._id;
        logSuccess(`User registered. Token acquired.`);

        // 2. UPDATE PROFILE (Test File Upload: Avatar)
        // logStep(2, 'Updating Profile (Uploading Avatar)... [/api/auth/profile]');
        // const profileForm = new FormData();
        // profileForm.append('name', 'Student Updated');
        // profileForm.append('avatar', fs.createReadStream(TEST_IMAGE_PATH)); // Matches uploadUser.single('avatar')

        // const profileRes = await axios.put(`${BASE_URL}/api/auth/profile`, profileForm, {
        //     headers: {
        //         ...profileForm.getHeaders(),
        //         Authorization: `Bearer ${authToken}`
        //     }
        // });
        // logSuccess(`Profile avatar uploaded. User: ${profileRes.data.data.name}`);

        // 3. CREATE PRODUCT (Test File Upload: Image)
        logStep(3, 'Creating Product (Uploading Image)... [/api/products]');
        const productForm = new FormData();
        productForm.append('name', 'Lecture Assignment Laptop');
        productForm.append('price', 1500);
        productForm.append('brand', 'TechBrand');
        productForm.append('category', 'Electronics');
        productForm.append('countInStock', 10);
        productForm.append('description', 'A good laptop');
        productForm.append('image', fs.createReadStream(TEST_IMAGE_PATH)); // Matches uploadProduct.single('image')

        const productRes = await axios.post(`${BASE_URL}/api/products`, productForm, {
            headers: {
                ...productForm.getHeaders(),
                Authorization: `Bearer ${authToken}`
            }
        });
        productId = productRes.data.data._id;
        logSuccess(`Product created with ID: ${productId}`);

        // 4. GET ALL PRODUCTS
        logStep(4, 'Fetching All Products... [/api/products]');
        const allProductsRes = await axios.get(`${BASE_URL}/api/products`);
        logSuccess(`Fetched ${allProductsRes.data.data.length} products.`);

        // 5. GET SINGLE PRODUCT
        logStep(5, 'Fetching Single Product... [/api/products/:id]');
        const singleProductRes = await axios.get(`${BASE_URL}/api/products/${productId}`);
        logSuccess(`Retrieved product: ${singleProductRes.data.data.name}`);

        // 6. CREATE ORDER
        logStep(6, 'Creating Order... [/api/orders]');
        const orderRes = await axios.post(`${BASE_URL}/api/orders`, {
            orderItems: [
                {
                    name: 'Lecture Assignment Laptop',
                    qty: 1,
                    image: '/uploads/sample.jpg',
                    price: 1500,
                    product: productId
                }
            ],
            shippingAddress: { address: 'Campus 1', city: 'City', postalCode: '12345', country: 'Country' },
            paymentMethod: 'PayPal',
            itemsPrice: 1500,
            taxPrice: 100,
            shippingPrice: 10,
            totalPrice: 1610
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        orderId = orderRes.data.data._id;
        logSuccess(`Order created with ID: ${orderId}`);

        // 7. GET ORDER BY ID
        logStep(7, 'Fetching Order Details... [/api/orders/:id]');
        const getOrderRes = await axios.get(`${BASE_URL}/api/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        logSuccess(`Order retrieved. Total Price: ${getOrderRes.data.data.totalPrice}`);

        // 8. DELETE PRODUCT (Cleanup)
        // logStep(8, 'Deleting Product... [/api/products/:id]');
        // await axios.delete(`${BASE_URL}/api/products/${productId}`, {
        //     headers: { Authorization: `Bearer ${authToken}` }
        // });
        // logSuccess('Product deleted successfully.');

        console.log('\n----------------------------------------------');
        console.log('✅  ALL TESTS PASSED SUCCESSFULLY');
        console.log('----------------------------------------------');

    } catch (error) {
        logError(error);
    }
};

const migrate = async () => {
    try {
        logStep(1, 'Registering User... [/api/auth/register]');
        const uniqueEmail = `naufal@gmail.com`; // Random email to avoid duplicates
        const registerRes = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: uniqueEmail,
            password: 'naufal'
        });
        authToken = registerRes.data.data.token;
        userId = registerRes.data.data._id;
        logSuccess(`User logged in. Token acquired.`);

        const products = [
        {
            name: 'TWS Bluetooth Earbuds SoundBeat X1',
            price: 299000,
            brand: 'SoundBeat',
            category: 'Audio',
            countInStock: 120,
            description:
            'Wireless earbuds dengan Bluetooth 5.3, kualitas suara jernih, low latency, dan baterai tahan hingga 20 jam dengan charging case.'
        },
        {
            name: 'Smartwatch FitPro S2',
            price: 459000,
            brand: 'FitPro',
            category: 'Wearable',
            countInStock: 80,
            description:
            'Smartwatch dengan fitur monitor detak jantung, SpO2, sleep tracking, notifikasi aplikasi, dan tahan air IP67.'
        },
        {
            name: 'Mechanical Keyboard RGB MK68',
            price: 749000,
            brand: 'KeyMaster',
            category: 'Aksesoris Komputer',
            countInStock: 45,
            description:
            'Keyboard mechanical layout 65%, switch tactile, RGB backlight, cocok untuk gaming dan produktivitas.'
        },
        {
            name: 'Gaming Mouse UltraSpeed 7200 DPI',
            price: 249000,
            brand: 'HyperClick',
            category: 'Aksesoris Komputer',
            countInStock: 150,
            description:
            'Mouse gaming ergonomis dengan sensor presisi hingga 7200 DPI, 6 tombol programmable, dan RGB lighting.'
        },
        {
            name: 'Power Bank Fast Charge 20000mAh',
            price: 399000,
            brand: 'VoltPlus',
            category: 'Power & Charging',
            countInStock: 200,
            description:
            'Power bank kapasitas besar 20000mAh dengan fast charging, dual output USB, dan sistem perlindungan keamanan.'
        },
        {
            name: 'Aluminium Laptop Stand Adjustable',
            price: 189000,
            brand: 'DeskMate',
            category: 'Aksesoris Laptop',
            countInStock: 95,
            description:
            'Stand laptop berbahan aluminium, tinggi dapat diatur, membantu postur kerja lebih ergonomis dan pendinginan optimal.'
        },
        {
            name: 'Webcam Full HD 1080p ProView',
            price: 529000,
            brand: 'ProView',
            category: 'Kamera & Webcam',
            countInStock: 60,
            description:
            'Webcam Full HD 1080p dengan mikrofon stereo, auto focus, cocok untuk meeting online dan streaming.'
        },
        {
            name: 'Portable Bluetooth Speaker BassGo Mini',
            price: 349000,
            brand: 'BassGo',
            category: 'Audio',
            countInStock: 110,
            description:
            'Speaker bluetooth portable dengan bass kuat, tahan air IPX5, dan baterai hingga 10 jam pemakaian.'
        },
        {
            name: 'External SSD 512GB USB-C',
            price: 1199000,
            brand: 'DataFast',
            category: 'Storage',
            countInStock: 40,
            description:
            'SSD eksternal 512GB dengan koneksi USB-C, kecepatan transfer tinggi, desain ringkas dan tahan guncangan.'
        },
        {
            name: 'USB-C Hub 6-in-1 Multifunction',
            price: 429000,
            brand: 'HubLink',
            category: 'Aksesoris Komputer',
            countInStock: 70,
            description:
            'USB-C hub 6-in-1 dengan HDMI, USB 3.0, SD card reader, dan PD charging, kompatibel dengan laptop modern.'
        }
        ];

        for (let i = 0; i < products.length; i++) {
        const product = products[i];

        logStep(i + 1, `Creating Product ${i + 1} [/api/products]`);

        const productForm = new FormData();
        productForm.append('name', product.name);
        productForm.append('price', product.price);
        productForm.append('brand', product.brand);
        productForm.append('category', product.category);
        productForm.append('countInStock', product.countInStock);
        productForm.append('description', product.description);
        productForm.append(
            'image',
            fs.createReadStream(`./testing/product-${i + 1}.jpg`)
        );

        const productRes = await axios.post(
            `${BASE_URL}/api/products`,
            productForm,
            {
            headers: {
                ...productForm.getHeaders(),
                Authorization: `Bearer ${authToken}`
            }
            }
        );

        const productId = productRes.data.data._id;
        logSuccess(`Product created with ID: ${productId}`);
        } 
    } catch (error) {
            logError(error);
        }
}

migrate()