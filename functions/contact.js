export async function onRequestPost(context) {
  console.log('Contact function triggered')
  
  try {
    console.log('Processing form submission')
    
    const formData = await context.request.formData()
    const name = formData.get('name')
    const email = formData.get('email')
    const subject = formData.get('subject')
    const message = formData.get('message')

    console.log('Form data received')

    if (!name || !email || !subject || !message) {
      console.log('Missing required fields')
      return new Response(JSON.stringify({ error: 'All fields are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('Invalid email format')
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('Validation passed')

    if (!context.env.RESEND_API_KEY || !context.env.DESTINATION_EMAIL) {
      console.error('Missing environment variables')
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
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
    
    console.log('Sending email')
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    console.log('Email API response:', response.status)

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Email API error:', errorData)
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const result = await response.json()
    console.log('Email sent successfully:', result.id)

    return new Response(JSON.stringify({ success: 'Message sent successfully!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Function error:', error.message)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    })
  }
}
