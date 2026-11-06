import { FC } from 'react'

const Terms: FC = () => {
  return (
    <div className="max-w-3xl mt-8 mb-16">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="muted mt-2">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="panel mt-8 space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="muted leading-relaxed">
            By accessing and using StudentFolio ("Service"), you accept and agree to be bound by
            the terms and provision of this agreement. If you do not agree to abide by the above,
            please do not use this service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Use License</h2>
          <p className="muted leading-relaxed mb-3">
            Permission is granted to temporarily download one copy of the materials (including
            information and software) on StudentFolio for personal, non-commercial transitory
            viewing only. This is the grant of a license, not a transfer of title, and under this
            license you may not:
          </p>
          <ul className="muted space-y-2">
            <li>Modifying or copying the materials</li>
            <li>Using the materials for any commercial purpose or for any public display</li>
            <li>Attempting to decompile or reverse engineer any software contained on the site</li>
            <li>Removing any copyright or other proprietary notations from the materials</li>
            <li>Transferring the materials to another person or "mirroring" the materials</li>
            <li>Using the materials for any unlawful purpose or in violation of applicable laws</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
          <p className="muted leading-relaxed">
            When you create an account with StudentFolio, you are responsible for maintaining the
            confidentiality of your password and you are responsible for all activities that occur
            under your account. You agree that you will provide accurate, current, and complete
            information during the registration process. You further agree to promptly update
            information about your account to keep it accurate, current, and complete.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Portfolio Content</h2>
          <p className="muted leading-relaxed mb-3">
            You retain all rights to the content you upload to StudentFolio. By uploading content,
            you grant StudentFolio a non-exclusive, royalty-free license to display and distribute
            your portfolio as part of our Service. You represent and warrant that:
          </p>
          <ul className="muted space-y-2">
            <li>You own or have the right to upload all content</li>
            <li>
              Your content does not infringe any intellectual property, privacy, or other rights
            </li>
            <li>Your content does not violate any applicable laws</li>
            <li>Your content is not defamatory, obscene, or otherwise inappropriate</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Prohibited Activities</h2>
          <p className="muted leading-relaxed">
            You agree not to engage in any of the following prohibited activities:
          </p>
          <ul className="muted space-y-2 mt-3">
            <li>Harassing, threatening, or intimidating other users</li>
            <li>Uploading illegal, harmful, or abusive content</li>
            <li>Attempting to gain unauthorized access to our systems</li>
            <li>Transmitting viruses or malicious code</li>
            <li>Spam, phishing, or fraudulent activities</li>
            <li>Violating any applicable laws or regulations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Disclaimer of Warranties</h2>
          <p className="muted leading-relaxed">
            The materials on StudentFolio are provided "as is". StudentFolio makes no warranties,
            expressed or implied, and hereby disclaims and negates all other warranties including,
            without limitation, implied warranties or conditions of merchantability, fitness for a
            particular purpose, or non-infringement of intellectual property or other violation of
            rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Limitations of Liability</h2>
          <p className="muted leading-relaxed">
            In no event shall StudentFolio or its suppliers be liable for any damages (including,
            without limitation, damages for loss of data or profit, or due to business
            interruption) arising out of the use or inability to use the materials on
            StudentFolio, even if StudentFolio or an authorized representative has been notified
            orally or in writing of the possibility of such damage.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Accuracy of Materials</h2>
          <p className="muted leading-relaxed">
            The materials appearing on StudentFolio could include technical, typographical, or
            photographic errors. StudentFolio does not warrant that any of the materials on the
            Service are accurate, complete, or current.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Links</h2>
          <p className="muted leading-relaxed">
            StudentFolio has not reviewed all of the sites linked to its website and is not
            responsible for the contents of any such linked site. The inclusion of any link does
            not imply endorsement by StudentFolio of the site. Use of any such linked website is
            at the user's own risk.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Modifications</h2>
          <p className="muted leading-relaxed">
            StudentFolio may revise these terms of service for the website at any time without
            notice. By using this website, you are agreeing to be bound by the then current version
            of these terms of service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">11. Termination</h2>
          <p className="muted leading-relaxed">
            StudentFolio may terminate or suspend your account and right to use the Service
            immediately, without prior notice or liability, for any reason whatsoever, including
            if you breach the Terms.
          </p>
        </section>

        <div className="bg-surface/50 border border-secondary-text/20 rounded-lg p-4 mt-6">
          <p className="text-sm muted italic">
            ⚠️ <strong>Disclaimer:</strong> This is a template terms of service. You should consult
            with a lawyer to ensure these terms comply with applicable laws in your jurisdiction.
            This template is not a substitute for professional legal advice.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Terms
