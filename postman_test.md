Perfect — I’ll walk you through this **slow, clean, step-by-step**, assuming **zero gaps** and **no prior Postman setup mistakes**. Follow it in order and you’ll be 100% fine.

---

# ✅ COMPLETE STEP-BY-STEP POSTMAN TESTING GUIDE

**E-Commerce API (Interior & Design)**

---

## 🔹 STEP 0: Prerequisites (DO NOT SKIP)

### 0.1 Start your backend server

Open your project folder in terminal and run:

```bash
python app.py
```

You should see something like:

```
Running on http://127.0.0.1:5000/
```

✔ This confirms the server is live
❌ If this is not running → NOTHING will work in Postman

---

## 🔹 STEP 1: Open & Prepare Postman

1. Open **Postman**
2. Click **“New” → “HTTP Request”**
3. You’ll see:

   * Method dropdown (GET/POST/etc)
   * URL bar
   * Tabs: Params | Authorization | Headers | Body

You are now ready to test APIs.

---

## 🔹 STEP 2: CREATE INTERIOR (POST)

### 2.1 Set request details

* **Method:** `POST`
* **URL:**

```
http://localhost:5000/interior
```

---

### 2.2 Add Headers

1. Click **Headers** tab
2. Add:

| Key          | Value            |
| ------------ | ---------------- |
| Content-Type | application/json |

---

### 2.3 Add Body

1. Click **Body** tab
2. Select **raw**
3. Select **JSON** (dropdown on right)
4. Paste this:

```json
{
  "subcategory": "bedroom",
  "category": "wooden"
}
```

---

### 2.4 Send Request

Click **Send**

---

### 2.5 Expected Response (IMPORTANT)

You should get **Status: 201 Created**

```json
{
  "interior_id": "abc123xyz"
}
```

📌 **COPY THIS `interior_id`**
You will need it in the next steps.

---

## 🔹 STEP 3: GET ALL INTERIORS (GET)

### 3.1 Create new request

Click **New → HTTP Request**

* **Method:** `GET`
* **URL:**

```
http://localhost:5000/interior
```

---

### 3.2 Headers

❌ No headers required
(You can leave Headers empty)

---

### 3.3 Send Request

Click **Send**

---

### 3.4 Expected Response (200 OK)

```json
[
  {
    "interior_id": "abc123xyz",
    "subcategory": "bedroom",
    "category": "wooden"
  }
]
```

✔ Confirms the interior was created successfully

---

## 🔹 STEP 4: UPDATE INTERIOR (PUT)

### 4.1 Create new request

* **Method:** `PUT`
* **URL:**

```
http://localhost:5000/interior/abc123xyz
```

(Replace `abc123xyz` with YOUR actual ID)

---

### 4.2 Headers

Add:

| Key          | Value            |
| ------------ | ---------------- |
| Content-Type | application/json |

---

### 4.3 Body

Go to **Body → raw → JSON**

```json
{
  "subcategory": "kitchen",
  "category": "aluminum"
}
```

---

### 4.4 Send Request

Click **Send**

---

### 4.5 Expected Response (200 OK)

```json
{
  "message": "Interior updated"
}
```

---

## 🔹 STEP 5: VERIFY UPDATE (GET AGAIN)

Repeat **GET /interior**

* **Method:** `GET`
* **URL:**

```
http://localhost:5000/interior
```

### Expected Result:

```json
[
  {
    "interior_id": "abc123xyz",
    "subcategory": "kitchen",
    "category": "aluminum"
  }
]
```

✔ Update confirmed

---

## 🔹 STEP 6: DELETE INTERIOR (DELETE)

### 6.1 Create new request

* **Method:** `DELETE`
* **URL:**

```
http://localhost:5000/interior/abc123xyz
```

---

### 6.2 Headers

❌ No headers needed

---

### 6.3 Send Request

Click **Send**

---

### 6.4 Expected Response (200 OK)

```json
{
  "message": "Interior deleted"
}
```

---

## 🔹 STEP 7: VERIFY DELETION

Run **GET /interior** again

Expected:

```json
[]
```

✔ Interior flow completed successfully

---

# 🎨 DESIGN COLLECTION (REPEAT SAME FLOW)

---

## 🔹 STEP 8: CREATE DESIGN (POST)

* **Method:** `POST`
* **URL:**

```
http://localhost:5000/design
```

### Headers

```
Content-Type: application/json
```

### Body

```json
{
  "details": "Modern minimalist living room with neutral colors"
}
```

### Response (201)

```json
{
  "design_id": "def456uvw"
}
```

📌 Copy `design_id`

---

## 🔹 STEP 9: GET ALL DESIGNS (GET)

```
GET http://localhost:5000/design
```

Expected:

```json
[
  {
    "design_id": "def456uvw",
    "details": "Modern minimalist living room with neutral colors"
  }
]
```

---

## 🔹 STEP 10: UPDATE DESIGN (PUT)

```
PUT http://localhost:5000/design/def456uvw
```

### Body

```json
{
  "details": "Contemporary bedroom with wooden accents"
}
```

Expected:

```json
{
  "message": "Design updated"
}
```

---

## 🔹 STEP 11: DELETE DESIGN (DELETE)

```
DELETE http://localhost:5000/design/def456uvw
```

Expected:

```json
{
  "message": "Design deleted"
}
```

---

# ⚠️ COMMON ERRORS & FIXES (READ THIS)

### ❌ Connection Error

* Server not running
* Fix: `python app.py`

---

### ❌ 404 Not Found

* Wrong URL
* Fix: check spelling (`/interior`, `/design`)

---

### ❌ 500 Internal Server Error

* Firebase issue
* Fix:

  * Check `key.json`
  * Ensure Firestore is enabled
  * Check terminal logs

---

### ❌ Empty GET Response

* You didn’t create data yet
* Fix: run POST first

---

# ✅ FINAL CONFIRMATION CHECKLIST

✔ Server running
✔ POST works
✔ GET shows data
✔ PUT updates data
✔ DELETE removes data

---

If you want next:

* 🔐 Auth with JWT
* 🧪 Automated Postman Collection
* 📦 Add Furniture/Product APIs
* 🔥 Firebase security rules

Just tell me.
