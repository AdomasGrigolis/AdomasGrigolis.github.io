export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData()
    const name = formData.get('name')
    const email = formData.get('email')
    const subject = formData.get('subject')
    const message = formData.get('message')

    if (!name || !email || !subject || !message) {
      return new Response('All fields are required', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response('Invalid email format', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      })
    }

    if (!context.env.RESEND_API_KEY || !context.env.DESTINATION_EMAIL) {
      return new Response('Server configuration error', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      })
    }

    const emailData = {
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: [context.env.DESTINATION_EMAIL],
      subject: `Portfolio Contact: ${subject}`,
      html: `
        <h3>New contact form submission from your portfolio</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>This message was sent from your portfolio contact form.</small></p>
      `,
      reply_to: [email]
    }
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Email sending failed:', errorData)
      return new Response('Failed to send email', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      })
    }

    return new Response('Your message has been sent. Thank you!', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    })

  } catch (error) {
    console.error('Function error:', error.message)
    return new Response('Internal server error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    })
  }
}
