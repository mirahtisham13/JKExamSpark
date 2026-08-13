import requests

BASE_URL = "http://localhost:8000/api/v1"

def run_tests():
    print("Testing Backend API Flow...")
    
    # Test 1: Check health
    try:
        r = requests.get(f"{BASE_URL.replace('/api/v1', '')}/health")
        print(f"Healthcheck: {r.status_code}")
    except Exception as e:
        print(f"Healthcheck Failed: {e}")
        return

if __name__ == "__main__":
    run_tests()
