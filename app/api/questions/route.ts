import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role for storage operations to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const endDate = formData.get('endDate') as string
    const endTime = formData.get('endTime') as string
    const category = formData.get('category') as string
    const photo = formData.get('photo') as File | null

    let photoUrl = null

    // Upload photo to Supabase Storage if exists
    if (photo && photo.size > 0) {
      try {
        const fileExt = photo.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${fileName}`

        // Convert File to ArrayBuffer
        const arrayBuffer = await photo.arrayBuffer()
        const fileBuffer = new Uint8Array(arrayBuffer)

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('question-photos')
          .upload(filePath, fileBuffer, {
            contentType: photo.type,
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          return NextResponse.json(
            { error: 'Failed to upload photo', details: uploadError.message },
            { status: 500 }
          )
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('question-photos')
          .getPublicUrl(filePath)
        
        photoUrl = publicUrl
        console.log('Photo uploaded successfully:', photoUrl)
      } catch (uploadErr: any) {
        console.error('Photo upload exception:', uploadErr)
        return NextResponse.json(
          { error: 'Failed to process photo', details: uploadErr.message },
          { status: 500 }
        )
      }
    }

    // Insert question into database
    const { data, error } = await supabase
      .from('questions')
      .insert([
        {
          title,
          description,
          end_date: endDate,
          end_time: endTime,
          category,
          photo_url: photoUrl,
          status: 'pending', // Default status
          symbol: category.toUpperCase(),
          yes_percentage: 50,
          no_percentage: 50,
          volume: '$0',
          is_new: true
        }
      ])
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to submit question', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Question submitted successfully and waiting for approval',
      data: data[0]
    })
  } catch (error: any) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Fetch only approved questions
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch questions', details: error.message },
        { status: 500 }
      )
    }

    // Transform data to match Card interface
    const cards = data.map(q => ({
      id: q.id,
      title: q.title,
      symbol: q.symbol,
      description: q.description,
      image: q.photo_url,
      status: `Open • Ends ${q.end_date}`,
      isNew: q.is_new,
      yesPercentage: q.yes_percentage,
      noPercentage: q.no_percentage,
      volume: q.volume,
      category: q.category
    }))

    return NextResponse.json({ success: true, data: cards })
  } catch (error: any) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
