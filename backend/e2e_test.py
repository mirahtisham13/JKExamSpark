import httpx
import asyncio
import uuid

API_URL = "https://jkexamspark-backend.onrender.com/api/v1"

async def test_auth():
    print("Testing Auth & Identity...")
    async with httpx.AsyncClient(timeout=60.0) as client:
        # Create unique user
        uid = str(uuid.uuid4())[:8]
        user_data = {
            "email": f"student_{uid}@example.com",
            "username": f"student_{uid}",
            "password": "Password123!",
            "full_name": "Test Student"
        }
        
        # 1. Register
        res = await client.post(f"{API_URL}/auth/register", json=user_data)
        assert res.status_code == 201, f"Failed to register: {res.text}"
        print(f"✅ Registered student: {user_data['username']}")

        # 2. Login
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        res = await client.post(f"{API_URL}/auth/login", json=login_data)
        assert res.status_code == 200, f"Failed to login: {res.text}"
        token = res.json()["access_token"]
        print("✅ Logged in successfully")

        # 3. Fetch Profile
        headers = {"Authorization": f"Bearer {token}"}
        res = await client.get(f"{API_URL}/users/profile", headers=headers)
        assert res.status_code == 200, f"Failed to fetch profile: {res.text}"
        profile = res.json()
        assert profile["email"] == user_data["email"]
        print("✅ Fetched profile successfully")

        return token, profile

async def test_admin():
    print("Testing Admin Operations...")
    async with httpx.AsyncClient(timeout=60.0) as client:
        # 1. Login as Admin
        admin_login = {
            "email": "admin@example.com",
            "password": "admin123"
        }
        res = await client.post(f"{API_URL}/auth/login", json=admin_login)
        assert res.status_code == 200, f"Failed admin login: {res.text}"
        admin_token = res.json()["access_token"]
        print("✅ Logged in as Admin")

        headers = {"Authorization": f"Bearer {admin_token}"}

        # 2. Create Exam
        exam_data = {
            "name": f"Mock JKSSB VLW {str(uuid.uuid4())[:4]}",
            "year": 2026,
            "status": "upcoming",
            "total_marks": 100,
            "description": "Test exam created by E2E script"
        }
        res = await client.post(f"{API_URL}/exams/", json=exam_data, headers=headers)
        assert res.status_code == 201, f"Failed to create exam: {res.text}"
        exam_id = res.json()["id"]
        print(f"✅ Created Exam: {exam_data['name']}")

        # 2a. Create Global Category
        cat_data = {
            "name": f"Open Merit {str(uuid.uuid4())[:4]}",
            "code": f"OM_{str(uuid.uuid4())[:4]}",
            "description": "General Category"
        }
        res = await client.post(f"{API_URL}/categories/", json=cat_data, headers=headers)
        assert res.status_code == 201, f"Failed to create category: {res.text}"
        category_id = res.json()["id"]
        print(f"✅ Created Category: {cat_data['name']}")

        # 3. Add Category Vacancies
        category_data = {
            "exam_id": exam_id,
            "category_id": category_id,
            "vacancies": 500
        }
        res = await client.post(f"{API_URL}/exams/{exam_id}/categories", json=category_data, headers=headers)
        assert res.status_code in (200, 201), f"Failed to add category: {res.text}"
        print("✅ Added OM category with 500 vacancies")

        return admin_token, exam_id

async def test_materials(admin_token, exam_id):
    print("Testing Study Materials...")
    async with httpx.AsyncClient(timeout=60.0) as client:
        headers = {"Authorization": f"Bearer {admin_token}"}
        material_data = {
            "title": "JKSSB VLW Syllabus Guide",
            "description": "Complete syllabus PDF",
            "material_type": "pdf",
            "external_url": "https://example.com/syllabus.pdf",
            "exam_id": str(exam_id),
        }
        res = await client.post(f"{API_URL}/materials/", data=material_data, headers=headers)
        assert res.status_code in (200, 201), f"Failed to create material: {res.text}"
        print("✅ Uploaded study material resource")

async def test_quizzes(admin_token, exam_id, subject_id=None):
    print("Testing Quiz System...")
    async with httpx.AsyncClient(timeout=60.0) as client:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # 1. Create a Quiz
        quiz_data = {
            "title": "Mock JKSSB Full Length Test",
            "description": "A comprehensive test",
            "exam_id": exam_id,
            "subject_id": subject_id,
            "duration_minutes": 120,
            "total_marks": 100,
            "passing_marks": 35,
        }
        res = await client.post(f"{API_URL}/quizzes/", json=quiz_data, headers=headers)
        assert res.status_code == 201, f"Failed to create quiz: {res.text}"
        quiz_id = res.json()["id"]
        print(f"✅ Created Quiz: {quiz_data['title']}")

        # 1b. Publish the Quiz
        res = await client.put(f"{API_URL}/quizzes/{quiz_id}", json={"status": "published"}, headers=headers)
        assert res.status_code == 200, f"Failed to publish quiz: {res.text}"
        print("✅ Published Quiz")

        # 2. Add a Question
        question_data = {
            "quiz_id": quiz_id,
            "question_text": "What is the capital of Jammu and Kashmir in summer?",
            "option_a": "Jammu",
            "option_b": "Srinagar",
            "option_c": "Anantnag",
            "option_d": "Baramulla",
            "correct_option": "B",
            "explanation": "Srinagar is the summer capital.",
            "marks": 1.0,
            "negative_marks": 0.25
        }
        res = await client.post(f"{API_URL}/quizzes/{quiz_id}/questions", json=question_data, headers=headers)
        assert res.status_code == 201, f"Failed to add question: {res.text}"
        question_id = res.json()["id"]
        print("✅ Added Quiz Question")

        return quiz_id, question_id

async def test_quiz_attempt(student_token, quiz_id, question_id):
    print("Testing Student Quiz Attempt...")
    async with httpx.AsyncClient(timeout=60.0) as client:
        headers = {"Authorization": f"Bearer {student_token}"}

        # 1. Start Attempt
        res = await client.post(f"{API_URL}/quiz-attempts/start?quiz_id={quiz_id}", headers=headers)
        assert res.status_code == 201, f"Failed to start attempt: {res.text}"
        attempt_id = res.json()["id"]
        print("✅ Started Quiz Attempt")

        # 2. Submit Attempt
        ans_data = {
            "answers": [
                {
                    "question_id": question_id,
                    "selected_option": "B"
                }
            ]
        }
        res = await client.post(f"{API_URL}/quiz-attempts/{attempt_id}/submit", json=ans_data, headers=headers)
        assert res.status_code == 200, f"Failed to submit attempt: {res.text}"
        print("✅ Submitted Attempt")

async def main():
    student_token, profile = await test_auth()
    admin_token, exam_id = await test_admin()
    await test_materials(admin_token, exam_id)
    quiz_id, question_id = await test_quizzes(admin_token, exam_id)
    await test_quiz_attempt(student_token, quiz_id, question_id)

if __name__ == "__main__":
    asyncio.run(main())
