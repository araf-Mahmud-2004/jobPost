import Link from "next/link"
import { Briefcase } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground">JobPortal</span>
            </div>
            <p className="text-sm text-muted-foreground">Connecting talented professionals with their dream careers.</p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">For Job Seekers</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/jobs" className="hover:text-foreground transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-foreground transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-foreground transition-colors">
                  Upload Resume
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">For Employers</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/post-job" className="hover:text-foreground transition-colors">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/candidates" className="hover:text-foreground transition-colors">
                  Find Candidates
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 JobPortal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
