from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

hash = "$2b$12$mUpvbZ0pnfpFQuRANkPo9OcWqQUpxqGr.POw5Y0edwGFQ2iGon.Cu"
password = "admin123"

print("Matches?", pwd_context.verify(password, hash))
