
import EmailForm from '../components/EmailForm'

function ComposePage({
  formData,
  handleChange,
  handleSubmit,
  isSubmitting,
  submitMessage,
  submitSuccess,
  isEditing,
}) {
  return (
    <EmailForm
      formData={formData}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitMessage={submitMessage}
      submitSuccess={submitSuccess}
      isEditing={isEditing}
    />
  )
}

export default ComposePage
