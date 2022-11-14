import useSWR from "swr"

export const useBookmarks = () => {
  // @ts-ignore
  const fetcher = (...args) => fetch(...args).then((res) => res.json())
  const { data, error, mutate } = useSWR(`api/twitter/bookmarks`, fetcher)
  return {
    bookmarks: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}
