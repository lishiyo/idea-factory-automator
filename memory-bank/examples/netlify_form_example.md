# Netlify Form Example

Netlify Deployment: This approach only works if you are deploying the generated site to Netlify. Netlify's build bots scan your deployed HTML files for forms containing the netlify attribute.

HTML Form Attributes: The <form> tag needs specific attributes:

netlify (or data-netlify="true"): This is the key attribute that tells Netlify to process this form.

name="your-form-name": Give your form a unique name. This name will identify the form submissions in your Netlify dashboard (e.g., name="newsletter-signup").

Remove the action attribute (or set it to a custom success page path like /thank-you/ hosted on the same site). Netlify intercepts the submission.

method="POST" is standard but often handled implicitly by Netlify when the netlify attribute is present.

Input Fields: Keep standard input fields with name attributes (e.g., <input type="email" name="email">).

(Optional but Recommended) Honeypot Field: Add a "honeypot" field to help prevent spam: <input name="bot-field" /> hidden via CSS, and add netlify-honeypot="bot-field" to the <form> tag.

Updated LLM Prompt Instructions:

When instructing the LLM to generate the HTML, you would modify the form requirements section:

"...
4. Email Form: Include an HTML form designed for Netlify Forms.
* The <form> tag MUST have the netlify attribute (or data-netlify="true").
* The <form> tag MUST have a name attribute set to newsletter-signup.
* Do NOT include an external action URL (leave it blank or point it to a local path like /thank-you/ if a custom success page is desired).
* Include a label and an email input (<input type="email" name="email" required>).
* Include a submit button with the cta_text.
* (Optional but Recommended) Include a Netlify honeypot field for spam prevention: Add netlify-honeypot="bot-field" to the <form> tag, and include a hidden paragraph containing a label and input named bot-field: <p style="display: none;"><label>Don’t fill this out: <input name="bot-field"></label></p>. Style this paragraph to be hidden.
* Style the form nicely according to the overall theme.
... "

Workflow Summary:
Your AI agent generates this index.html file based on the prompt and Netlify form requirements.
The agent commits this file to a Git repository.
You connect this repository to your Netlify account.
When Netlify deploys the site, it detects the form with the netlify attribute.
Netlify automatically creates an endpoint to handle submissions for the form named "newsletter-signup".
When a user submits the form on the live site, Netlify captures the data.
You can view the submissions in your Netlify site dashboard under the "Forms" section.

Example Generated index.html (Using Netlify Forms):

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pawsitively Purrfect Playtime - High-End Cat Toys</title>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@600;700&family=Nunito:wght@400;600&display=swap" rel="stylesheet">

    <!-- Google Analytics (Replace G-XXXXXXXXXX) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX');
    </script>

    <style>
        /* --- Basic Reset & Variables --- */
        :root {
            --font-heading: 'Quicksand', sans-serif;
            --font-body: 'Nunito', sans-serif;
            --color-primary: #FFC0CB; /* Pastel Pink */
            --color-secondary: #98FB98; /* Mint Green */
            --color-accent: #FFD700; /* Soft Gold/Yellow */
            --color-background: #FFF8DC; /* Cornsilk White */
            --color-text-dark: #4A4A4A; /* Dark Gray */
            --color-text-light: #FFFFFF;
            --border-radius: 15px;
        }

        *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: var(--font-body);
            background-color: var(--color-background);
            color: var(--color-text-dark);
            line-height: 1.7;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }

        /* --- Layout & Container --- */
        .container {
            width: 90%;
            max-width: 960px;
            margin: 2rem auto;
            padding: 2rem;
            background-color: var(--color-text-light);
            border-radius: var(--border-radius);
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
        }

        /* --- Typography --- */
        h1, h2, h3 {
            font-family: var(--font-heading);
            color: var(--color-primary);
            margin-bottom: 1rem;
            line-height: 1.3;
            text-align: center;
        }
        h1 { font-size: 2.8rem; font-weight: 700; color: #E87A90; }
        h2 { font-size: 2rem; margin-top: 2.5rem; color: var(--color-secondary); border-bottom: 2px dashed var(--color-primary); display: inline-block; padding-bottom: 0.3rem; }
        p { margin-bottom: 1rem; text-align: center; }

        /* --- Header/Hero --- */
        .hero { text-align: center; margin-bottom: 3rem; padding: 2rem 0; border-bottom: 1px solid #eee; }
        .hero img { max-width: 300px; height: auto; border-radius: 50%; margin: 1rem auto; display: block; border: 5px solid var(--color-primary); box-shadow: 0 0 15px rgba(255, 192, 203, 0.5); }
        .hero .subheadline { font-size: 1.2rem; color: var(--color-text-dark); max-width: 600px; margin-left: auto; margin-right: auto; }

        /* --- Features Section --- */
        .features { display: flex; flex-wrap: wrap; justify-content: space-around; gap: 2rem; margin-top: 2rem; text-align: center; }
        .feature-item { flex-basis: calc(33.333% - 2rem); min-width: 250px; background-color: #f9f9f9; padding: 1.5rem; border-radius: var(--border-radius); border: 2px solid var(--color-secondary); transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .feature-item:hover { transform: translateY(-5px); box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1); }
        .feature-item img { width: 100px; height: 100px; object-fit: cover; border-radius: 50%; margin-bottom: 1rem; border: 3px solid var(--color-accent); }
        .feature-item h3 { font-size: 1.3rem; color: var(--color-primary); margin-bottom: 0.5rem; }

        /* --- Gallery Section --- */
        .gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 2rem; }
        .gallery img { width: 100%; height: 150px; object-fit: cover; border-radius: calc(var(--border-radius) / 2); border: 3px solid var(--color-primary); transition: transform 0.3s ease; }
        .gallery img:hover { transform: scale(1.05); }

        /* --- Email Signup Form (Netlify Adapted) --- */
        .signup-form { margin-top: 3rem; padding: 2rem; background-color: var(--color-secondary); border-radius: var(--border-radius); text-align: center; border: 3px dashed var(--color-primary); }
        .signup-form h2 { color: var(--color-text-dark); border: none; }
        .signup-form p { color: var(--color-text-dark); margin-bottom: 1.5rem; }
        .signup-form label { display: none; } /* Hide visual label */

        /* Style to hide honeypot */
        .hidden-field {
             opacity: 0;
             position: absolute;
             top: 0;
             left: 0;
             height: 0;
             width: 0;
             z-index: -1;
         }

        .signup-form input[type="email"] { font-family: var(--font-body); padding: 0.8rem 1rem; border: 2px solid var(--color-primary); border-radius: 20px; width: 100%; max-width: 350px; margin-bottom: 1rem; font-size: 1rem; text-align: center; }
        .signup-form input[type="email"]:focus { outline: none; border-color: var(--color-accent); box-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
        .signup-form button { font-family: var(--font-heading); background-color: var(--color-primary); color: var(--color-text-light); border: none; padding: 0.8rem 2rem; border-radius: 20px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: background-color 0.3s ease, transform 0.2s ease; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .signup-form button:hover { background-color: #E87A90; transform: translateY(-2px); }

        /* --- Footer --- */
        footer { text-align: center; padding: 1.5rem; margin-top: auto; background-color: var(--color-primary); color: var(--color-text-light); font-size: 0.9rem; }

        /* --- Responsiveness --- */
        @media (max-width: 768px) {
            h1 { font-size: 2.2rem; }
            h2 { font-size: 1.7rem; }
            .container { width: 95%; padding: 1.5rem; }
            .features { flex-direction: column; gap: 1.5rem; }
            .feature-item { flex-basis: 100%; }
            .gallery { grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); }
        }
        @media (max-width: 480px) {
            h1 { font-size: 1.8rem; }
            h2 { font-size: 1.5rem; }
            .hero img { max-width: 200px; }
            .signup-form input[type="email"] { max-width: 100%; }
            .signup-form button { width: 100%; max-width: 300px; }
        }
    </style>
</head>
<body>

    <header class="hero">
        <img src="https://placekitten.com/g/300/300" alt="Cute playful cat">
        <h1>Pawsitively Purrfect Playtime</h1>
        <p class="subheadline">Exquisite, high-end toys designed to delight your discerning and playful feline friend.</p>
    </header>

    <main class="container">
        <section id="features">
            <h2 style="margin-left: auto; margin-right:auto; display: table;">Why Choose Our Toys?</h2>
            <div class="features">
                <div class="feature-item">
                    <img src="https://placekitten.com/g/100/100" alt="Cat playing with feather toy">
                    <h3>Irresistible Fun</h3>
                    <p>Engaging designs with feathers, crinkles, and catnip options to satisfy natural hunting instincts.</p>
                </div>
                <div class="feature-item">
                    <img src="https://placekitten.com/g/101/101" alt="Close up of toy materials">
                    <h3>Premium & Safe Materials</h3>
                    <p>Crafted from durable, non-toxic, pet-safe materials like organic cotton, wood, and sturdy fabrics.</p>
                </div>
                <div class="feature-item">
                     <img src="https://placekitten.com/g/102/102" alt="Stylish cat toy">
                    <h3>Stylish Designs</h3>
                    <p>Beautiful toys that look great in your home, matching a modern and cute aesthetic.</p>
                </div>
            </div>
        </section>

        <section id="gallery">
             <h2 style="margin-left: auto; margin-right:auto; display: table;">Happy Customers!</h2>
             <div class="gallery">
                 <img src="https://placekitten.com/g/200/150" alt="Cute cat playing 1">
                 <img src="https://placekitten.com/g/201/150" alt="Cute cat playing 2">
                 <img src="https://placekitten.com/g/202/150" alt="Cute cat playing 3">
                 <img src="https://placekitten.com/g/203/150" alt="Cute cat playing 4">
                 <img src="https://placekitten.com/g/204/150" alt="Cute cat playing 5">
                 <img src="https://placekitten.com/g/205/150" alt="Cute cat playing 6">
             </div>
        </section>

        <section id="signup" class="signup-form">
            <h2>Be the First to Know!</h2>
            <p>Sign up for exclusive launch details, pre-order access, and cute cat content!</p>

            <!-- NETLIFY FORM -->
            <form name="newsletter-signup" method="POST" netlify netlify-honeypot="bot-field">
                <!-- Honeypot field (hidden) -->
                <p class="hidden-field">
                    <label>Don’t fill this out if you’re human: <input name="bot-field"></label>
                </p>
                 <!-- Actual visible form fields -->
                <label for="email-signup">Email Address</label> <!-- Label for accessibility -->
                <input type="email" id="email-signup" name="email" placeholder="your.email@example.com" required>
                <button type="submit">Get Early Access!</button>
            </form>
            <!-- END NETLIFY FORM -->

        </section>
    </main>

    <footer>
        © <span id="year"></span> Pawsitively Purrfect Playtime. All rights reserved.
        <script>document.getElementById('year').textContent = new Date().getFullYear();</script>
    </footer>

</body>
</html>
```
