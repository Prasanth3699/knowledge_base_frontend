'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Share2,
  FileText,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Star,
  Archive,
  Users,
  Clock,
  Grid,
  List,
} from 'lucide-react'

import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { api } from '@/lib/api'
import { getInitials, timeAgo, truncate, cn } from '@/lib/utils'
import { DocumentShare } from '@/types'
import { toast } from 'sonner'

export default function SharedDocumentsPage() {
  const router = useRouter()
  const [sharedDocuments, setSharedDocuments] = useState<DocumentShare[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('updated_at')
  const [filterBy, setFilterBy] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentShare[]>([])

  useEffect(() => {
    fetchSharedDocuments()
  }, [])

  useEffect(() => {
    let filtered = sharedDocuments

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(share =>
        share.document.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        share.document.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        share.shared_by.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply permission filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(share => share.permission === filterBy)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.document.title.localeCompare(b.document.title)
        case 'shared_by':
          return a.shared_by.full_name.localeCompare(b.shared_by.full_name)
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'updated_at':
        default:
          return new Date(b.document.updated_at).getTime() - new Date(a.document.updated_at).getTime()
      }
    })

    setFilteredDocuments(filtered)
  }, [sharedDocuments, searchQuery, sortBy, filterBy])

  const fetchSharedDocuments = async () => {
    try {
      const response = await api.get('/sharing/my-shares/')
      setSharedDocuments(response.data)
    } catch (error) {
      toast.error('Failed to fetch shared documents')
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  }

  const SharedDocumentCard = ({ share }: { share: DocumentShare }) => (
    <motion.div variants={itemVariants}>
      <Card className="group card-hover cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle
                className="text-lg leading-tight hover:text-primary transition-colors line-clamp-2"
                onClick={() => router.push(`/documents/${share.document.id}`)}
              >
                {share.document.title}
              </CardTitle>
              <CardDescription className="mt-1">
                {truncate(share.document.content.replace(/<[^>]*>/g, ''), 100)}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/documents/${share.document.id}`)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Star className="h-4 w-4 mr-2" />
                  Star
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Shared By */}
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={share.shared_by.avatar} />
                <AvatarFallback className="text-xs">
                  {getInitials(`${share.shared_by.first_name} ${share.shared_by.last_name}`)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                Shared by {share.shared_by.full_name}
              </span>
            </div>

            {/* Permission and Meta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={share.permission === 'edit' ? 'default' : 'secondary'}>
                  {share.permission === 'edit' ? 'Can Edit' : 'Can View'}
                </Badge>
                {share.document.visibility === 'public' && (
                  <Badge variant="outline">Public</Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {timeAgo(share.document.updated_at)}
              </span>
            </div>

            {/* Document Meta */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{share.document.word_count} words</span>
              <span>{share.document.view_count} views</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const SharedDocumentRow = ({ share }: { share: DocumentShare }) => (
    <motion.div variants={itemVariants}>
      <Card className="group card-hover">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => router.push(`/documents/${share.document.id}`)}
            >
              <h3 className="font-medium hover:text-primary transition-colors truncate">
                {share.document.title}
              </h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span>by {share.document.author.full_name}</span>
                <span>shared by {share.shared_by.full_name}</span>
                <span>{timeAgo(share.document.updated_at)}</span>
                <span>{share.document.word_count} words</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={share.permission === 'edit' ? 'default' : 'secondary'}>
                {share.permission === 'edit' ? 'Can Edit' : 'Can View'}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/documents/${share.document.id}`)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Open
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Star className="h-4 w-4 mr-2" />
                    Star
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuContent>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Share2 className="h-8 w-8" />
              Shared with Me
            </h1>
            <p className="text-muted-foreground">
              Documents that others have shared with you
            </p>
          </div>
          <Button onClick={() => router.push('/documents')} className="gap-2">
            <FileText className="h-4 w-4" />
            My Documents
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search shared documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated_at">Last modified</SelectItem>
              <SelectItem value="created_at">Date shared</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="shared_by">Shared by</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All permissions</SelectItem>
              <SelectItem value="view">Can view</SelectItem>
              <SelectItem value="edit">Can edit</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Shared Documents */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="animate-pulse">
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardHeader>
                <CardContent className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDocuments.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn(
              "space-y-4",
              viewMode === 'grid' && "grid gap-4 md:grid-cols-2 lg:grid-cols-3 space-y-0"
            )}
          >
            {filteredDocuments.map((share) =>
              viewMode === 'grid' ? (
                <SharedDocumentCard key={share.id} share={share} />
              ) : (
                <SharedDocumentRow key={share.id} share={share} />
              )
            )}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No shared documents</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterBy !== 'all'
                ? 'Try adjusting your search or filters'
                : 'When others share documents with you, they will appear here'}
            </p>
            <Button onClick={() => router.push('/documents')}>
              <FileText className="h-4 w-4 mr-2" />
              View My Documents
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}