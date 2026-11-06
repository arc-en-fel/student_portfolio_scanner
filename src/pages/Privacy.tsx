import { FC } from 'react'

const Privacy: FC = () => {
  return (
    <div className="max-w-3xl mt-8 mb-16">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="muted mt-2">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="panel mt-8 space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">Introduction</h2>
          <p className="muted leading-relaxed">
            StudentFolio ("we," "us," "our," or "Company") operates the StudentFolio website. This
            page informs you of our policies regarding the collection, use, and disclosure of
            personal data when you use our Service and the choices you have associated with that
            data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Information Collection and Use</h2>
          <p className="muted leading-relaxed mb-3">
            We collect several different types of information for various purposes to provide and
            improve our Service to you.
          </p>
          <ul className="muted space-y-2">
            <li>
              <strong className="text-primary-text">Account Information:</strong> Email address,
              name, password (encrypted)
            </li>
            <li>
              <strong className="text-primary-text">Portfolio Data:</strong> Educational
              background, skills, projects, certifications, and professional information
            </li>
            <li>
              <strong className="text-primary-text">Media:</strong> Profile pictures, project
              images, and uploaded documents
            </li>
            <li>
              <strong className="text-primary-text">Usage Information:</strong> Browser type,
              referrer, pages visited, and timestamps
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Use of Data</h2>
          <p className="muted leading-relaxed">StudentFolio uses the collected data for various purposes:</p>
          <ul className="muted space-y-2 mt-3">
            <li>To provide and maintain our Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To provide customer care and support</li>
            <li>To gather analysis or valuable information so that we can improve our Service</li>
            <li>To monitor the usage of our Service</li>
            <li>To detect, prevent, and address technical and security issues</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Security of Data</h2>
          <p className="muted leading-relaxed">
            The security of your data is important to us but remember that no method of
            transmission over the Internet or method of electronic storage is 100% secure. While
            we strive to use commercially acceptable means to protect your Personal Data, we
            cannot guarantee its absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Links to Other Sites</h2>
          <p className="muted leading-relaxed">
            Our Service may contain links to other sites that are not operated by us. If you click
            a third-party link, you will be directed to that third party's site. We strongly
            advise you to review the Privacy Policy of every site you visit. We have no control
            over and assume no responsibility for the content, privacy policies, or practices of
            any third-party sites or services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Changes to This Privacy Policy</h2>
          <p className="muted leading-relaxed">
            We may update our Privacy Policy from time to time. We will notify you of any changes
            by posting the new Privacy Policy on this page and updating the "Last updated" date
            at the top of this Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
          <p className="muted leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at
            support@studentfolio.com
          </p>
        </section>

        <div className="bg-surface/50 border border-secondary-text/20 rounded-lg p-4 mt-6">
          <p className="text-sm muted italic">
            ⚠️ <strong>Disclaimer:</strong> This is a template privacy policy. You should consult
            with a lawyer to ensure this policy complies with applicable laws in your jurisdiction.
            This template is not a substitute for professional legal advice.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Privacy
