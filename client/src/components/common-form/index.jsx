import { useState } from "react";
import { Button } from "../ui/button";
import FormControls from "./form-controls";
import FaceCaptureModal from "../faceRecognition/faceRecognition";

function CommonForm({
  handleSubmit,
  buttonText,
  formControls = [],
  formData,
  setFormData,
  isButtonDisabled = false,
  requireLoginFaceCapture = false,
  requireRegisterFaceCapture = false,
  registerFaceCaptured,
  setRegisterFaceCaptured,
  loginFaceCaptured,
  setLoginFaceCaptured,
  setIsPasswordValid,
  isPasswordValid
}) {
  const [showCaptureDialog, setShowCaptureDialog] = useState(false);

  const handleFaceCapture = (faceData) => {
    const descriptorArray = Array.from(faceData);

    if (requireRegisterFaceCapture) {
      setRegisterFaceCaptured(true);
    }

    if (requireLoginFaceCapture) {
      setLoginFaceCaptured(true);
    }

    setFormData((prev) => ({
      ...prev,
      faceDescriptor: descriptorArray,
    }));

    setShowCaptureDialog(false);
  };

  const showFaceCheckbox = requireLoginFaceCapture || requireRegisterFaceCapture;
  const isFaceCaptured = requireRegisterFaceCapture ? registerFaceCaptured : loginFaceCaptured;

  return (
    <form onSubmit={handleSubmit}>
      <FormControls
        formControls={formControls}
        formData={formData}
        setFormData={setFormData}
        setIsPasswordValid={setIsPasswordValid}
        isPasswordValid={isPasswordValid}

      />

      {showFaceCheckbox && (
        <div className="flex items-center space-x-2 mt-4">
          <input
            type="checkbox"
            checked={isFaceCaptured}
            onChange={() => setShowCaptureDialog(true)}
            className="w-4 h-4"
          />
          <label className="text-sm text-gray-600">
            {requireRegisterFaceCapture
              ? "Capture your face for registration (required)"
              : "Capture your face for login (required)"}
          </label>
        </div>
      )}

      {showCaptureDialog && (
        <FaceCaptureModal
          onClose={() => setShowCaptureDialog(false)}
          onCapture={handleFaceCapture}
        />
      )}

      <Button
        disabled={
          isButtonDisabled ||
          (requireRegisterFaceCapture && !registerFaceCaptured) ||
          (requireLoginFaceCapture && !loginFaceCaptured) || !isPasswordValid
        }
        type="submit"
        className="mt-5 w-full"
      >
        {buttonText || "Submit"}
      </Button>
    </form>
  );
}

export default CommonForm;
