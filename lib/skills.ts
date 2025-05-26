// 🔹 Add a certification to a skill
export async function addCertification(uid: string, skillId: number, certification: Certification): Promise<void> {
    const skills = await fetchUserSkills(uid) || []
    const skillIndex = skills.findIndex(skill => skill.id === skillId)
    
    if (skillIndex >= 0) {
      // Make sure certifications array exists
      if (!skills[skillIndex].certifications) {
        skills[skillIndex].certifications = []
      }
      
      // Add new certification
      skills[skillIndex].certifications.push(certification)
      await updateUserSkills(uid, skills)
    }
  }
  
  // 🔹 Remove a certification from a skill
  export async function removeCertification(uid: string, skillId: number, certificationId: number): Promise<void> {
    const skills = await fetchUserSkills(uid) || []
    const skillIndex = skills.findIndex(skill => skill.id === skillId)
    
    if (skillIndex >= 0 && skills[skillIndex].certifications) {
      // Filter out the certification to remove
      skills[skillIndex].certifications = skills[skillIndex].certifications.filter(
        cert => cert.id !== certificationId
      )
      
      await updateUserSkills(uid, skills)
    }
  }import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
  import { db } from "./firebase"
  
  // Certification type
  export interface Certification {
    id: number
    name: string
    url: string
  }
  
  // Skill entry type that matches the frontend requirements
  export interface SkillEntry {
    id: number
    name: string
    level: "Beginner" | "Intermediate" | "Advanced" | "Expert"
    years: number
    description: string
    certifications: Certification[]
  }
  
  const SKILLS_COLLECTION = "skills"
  
  // 🔹 Fetch skills for a user by UID
  export async function fetchUserSkills(uid: string): Promise<SkillEntry[] | null> {
    const ref = doc(db, SKILLS_COLLECTION, uid)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      return snap.data().skills as SkillEntry[]
    }
    return []  // Return empty array instead of null for easier frontend handling
  }
  
  // 🔹 Create skills for a user if they don't have any yet
  export async function createUserSkillsIfMissing(uid: string, skills: SkillEntry[] = []): Promise<void> {
    const existing = await fetchUserSkills(uid)
    if (!existing || existing.length === 0) {
      const ref = doc(db, SKILLS_COLLECTION, uid)
      await setDoc(ref, { skills })
    }
  }
  
  // 🔹 Update skills (overwrite existing list)
  export async function updateUserSkills(uid: string, updatedSkills: SkillEntry[]): Promise<void> {
    const ref = doc(db, SKILLS_COLLECTION, uid)
    try {
      await updateDoc(ref, { skills: updatedSkills })
    } catch (error) {
      // If document doesn't exist yet, create it
      await setDoc(ref, { skills: updatedSkills })
    }
  }
  
  // 🔹 Add a single skill
  export async function addSkill(uid: string, newSkill: SkillEntry): Promise<void> {
    const skills = await fetchUserSkills(uid) || []
    
    // Check if skill with same ID or name already exists
    const existingSkillIndex = skills.findIndex(
      skill => skill.id === newSkill.id || skill.name.toLowerCase() === newSkill.name.toLowerCase()
    )
    
    if (existingSkillIndex >= 0) {
      // Update existing skill
      skills[existingSkillIndex] = newSkill
    } else {
      // Add new skill
      skills.push(newSkill)
    }
    
    await updateUserSkills(uid, skills)
  }
  
  // 🔹 Delete a skill by ID
  export async function deleteSkill(uid: string, skillId: number): Promise<void> {
    const skills = await fetchUserSkills(uid) || []
    const updatedSkills = skills.filter(skill => skill.id !== skillId)
    
    if (updatedSkills.length !== skills.length) {
      await updateUserSkills(uid, updatedSkills)
    }
  }
  
  // 🔹 Update a single skill
  export async function updateSkill(uid: string, skillId: number, updatedSkill: Partial<SkillEntry>): Promise<void> {
    const skills = await fetchUserSkills(uid) || []
    const skillIndex = skills.findIndex(skill => skill.id === skillId)
    
    if (skillIndex >= 0) {
      skills[skillIndex] = { ...skills[skillIndex], ...updatedSkill }
      await updateUserSkills(uid, skills)
    }
  }