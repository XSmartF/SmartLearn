import { useParams } from "react-router-dom"

export default function TestLibrary() {
  const { id } = useParams()
  
  console.log("TestLibrary rendered with ID:", id)
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Test Library Page</h1>
      <p className="text-lg">Library ID: {id}</p>
      <p className="text-sm text-gray-600">If you see this, routing is working!</p>
    </div>
  )
}
