import { ChevronDownIcon, PencilIcon } from "@heroicons/react/20/solid"
import { useMutation, useQuery } from "@blitzjs/rpc"
import getBookmarks from "../queries/getBookmarks"
import { ExportToCsv } from "export-to-csv"
import { useState } from "react"
import updateName from "../mutations/updateName"

const Bookmarks = () => {

  const [bookmarks, {
    setQueryData
  }] = useQuery(getBookmarks, null)
  const [editName] = useMutation(updateName)

  const [editingName, setEditingName] = useState("")
  const [currentName, setCurrentName] = useState("")

  const exportToCsv = () => {
    if(!bookmarks) return
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      showTitle: false,
      title: 'Twitter Bookmarks',
      useTextFile: false,
      useBom: true,
      headers: ['Name', 'URL', 'Message']
    };
    const csvExporter = new ExportToCsv(options);

    csvExporter.generateCsv(bookmarks.map((bookmark, i) => {
      return {
        name: bookmark.name ?? `${i}`,
        url: bookmark.link,
        message: ''
        // message: bookmark.tweet.message
      }
    } ));
  }

  const handleAddName = async (e) => {
    e.preventDefault()
    const newBookmark = await editName({ name: currentName, tweetId: editingName })
    await setQueryData(bookmarks.map((bookmark) => {
      if(bookmark.tweet.tweet_id === editingName) {
        return newBookmark
      }
      return bookmark
    }), {refetch: false})
    setEditingName("")
  }

  const handleEditName = (e) => {
    e.preventDefault()
    const tweetId = e.target.dataset.tweetId
    setEditingName(tweetId)
    setCurrentName(e.target.dataset.tweetName)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Users</h1>
          <p className="mt-2 text-sm text-gray-700">
            Your bookmarks
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            onClick={exportToCsv}
          >
              Export to CSV
          </button>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    <a href="#" className="group inline-flex">
                      Name
                    </a>
                  </th>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    <a href="#" className="group inline-flex">
                      Tweet
                      <span
                        className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                          <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                    </a>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    <a href="#" className="group inline-flex">
                      Author
                      <span className="ml-2 flex-none rounded bg-gray-200 text-gray-900 group-hover:bg-gray-300">
                          <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                    </a>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    <a href="#" className="group inline-flex">
                      Links
                      <span
                        className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                          <ChevronDownIcon
                            className="invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible"
                            aria-hidden="true"
                          />
                        </span>
                    </a>
                  </th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                {bookmarks && bookmarks.map((bookmark) => (
                  <tr key={bookmark.tweet.tweet_id}>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {editingName !== bookmark.tweet.tweet_id ? (
<>
                        {bookmark.name && (
                          <div className="flex flex-row">
                            <a href={bookmark.link} target="_blank" rel="noreferrer">
                              {bookmark.name}
                            </a>

                            <a onClick={handleEditName} >
                              <PencilIcon className="h-5 w-5 cursor-pointer" aria-hidden="true" data-tweet-id={bookmark.tweet.tweet_id} data-tweet-name={bookmark.name} />
                            </a>

                          </div>
                        )}
                        {!bookmark.name && (
                          <span><a className="cursor-pointer" onClick={handleEditName} data-tweet-id={bookmark.tweet.tweet_id}>Add Name</a> </span>
                        )}
                      </>
                        ) : (
                          <form onSubmit={handleAddName}>
                            <input className="border border-2" type="text" name="name" value={currentName} onChange={(e) => setCurrentName(e.target.value)} />
                            <button type="submit">Save</button>
                          </form>
                        )}
                    </td>
                    <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {bookmark.tweet.message}
                    </td>
                    <td
                      className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{bookmark.tweet.author.twitter_name}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">Links go here</td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Bookmarks
