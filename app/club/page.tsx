import { redirect } from 'next/navigation'

// /club is the guessable URL for The Club and used to 404. The page itself lives
// at /my-group.
export default function ClubPage() {
  redirect('/my-group')
}
