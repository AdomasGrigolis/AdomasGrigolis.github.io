export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData()
    const name = formData.get('name')
    const email = formData.get('email')
    const subject = formData.get('subject')
    const message = formData.get('message')

    // Basic validation
    if (!name || !email || !subject || !message) {
      return new Response('All fields are required', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response('Invalid email format', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      })
    }

    // For now, we'll log the form data and return success
    // You can integrate with an email service like Resend, SendGrid, etc.
    console.log('Form submission:', {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString()
    })

    // TODO: Integrate with email service
    // Example with Resend API:
    /*
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@yourdomain.com',
        to: 'a.grigolis@student.tudelft.nl',
        subject: `Portfolio Contact: ${subject}`,
        html: `
          <h3>New contact form submission</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `
      }),
    })

    if (!emailResponse.ok) {
      throw new Error('Failed to send email')
    }
    */

    return new Response('Message sent successfully!', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    })
  } catch (error) {
    console.error('Error processing form:', error)
    return new Response('Error processing form submission', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    })
  }
}
