import { GoogleLogin } from "@react-oauth/google";

export default function GoogleLoginButton({ onSuccess, onFailure }) {
  return (
    <div className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition duration-300">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Sign in to continue</h2>
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onFailure}
        useOneTap
      />
    </div>
  );
}