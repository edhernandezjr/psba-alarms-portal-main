import { find } from 'lodash';
import { MSGraphClient } from '@microsoft/sp-http';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';

export async function getPagedGraphResults(
  graphClient: MSGraphClient,
  requestUrl: string
): Promise<MicrosoftGraph.Group[]> {
  let hasPage = true;

  let groups: MicrosoftGraph.Group[] = [];

  while (hasPage) {
    const pageResponse: any = await graphClient
      .api(requestUrl)
      .headers({
        'Content-Type': 'application/json',
        pragma: 'no-cache',
        'cache-control': 'no-cache'
      })
      .get();

    groups = groups.concat(pageResponse ? pageResponse.value : []);

    if (pageResponse['@odata.nextLink']) {
      requestUrl = pageResponse['@odata.nextLink'];
    } else {
      hasPage = false;
    }
  }

  return groups;
}

export function getFormattedDateTime(
  dateTime: string,
  options = {},
  format = 'en-AU',
  timeZone = ''
): string {
  /**
   * Split date and reconstitute to workaround difference betweem browser dates
   */
  const arr: any[] = dateTime.split(/[^0-9]/);
  let newDate: any = new Date(
    arr[0],
    arr[1] - 1,
    arr[2],
    arr[3],
    arr[4],
    arr[5]
  );

  if (timeZone === 'UTC') {
    newDate = newDate.valueOf() - new Date().getTimezoneOffset() * 60000;
  }

  const formattedDateTime = new Intl.DateTimeFormat(format, options).format(
    newDate
  );

  return formattedDateTime;
}

/**
 * Sorting function for integers
 *
 *  -To be used
 */
export function sortItemsByInt(items: any, sortBy: any, descending = false) {
  if (descending) {
    return items.sort((a: any, b: any) => {
      return b[sortBy] - a[sortBy];
    });
  } else {
    return items.sort((a: any, b: any) => {
      return a[sortBy] - b[sortBy];
    });
  }
}

/**
 * Sorting function used in the DetailsList component column sorting
 *
 */
export function sortItems(items: any, sortBy: any, descending = false) {
  if (descending) {
    return items.sort((a: any, b: any) => {
      if (a[sortBy] < b[sortBy]) {
        return 1;
      }
      if (a[sortBy] > b[sortBy]) {
        return -1;
      }
      return 0;
    });
  } else {
    return items.sort((a: any, b: any) => {
      if (a[sortBy] < b[sortBy]) {
        return -1;
      }
      if (a[sortBy] > b[sortBy]) {
        return 1;
      }
      return 0;
    });
  }
}

/**
 * Sorting function used for search results sorting
 *
 */
export function sortSearchItems(items: any, sortBy: any, descending = false) {
  if (descending) {
    return items.sort((a: any, b: any) => {
      const aVal = find(a.Cells, ['Key', sortBy]).Value;
      const bVal = find(b.Cells, ['Key', sortBy]).Value;

      if (aVal < bVal) {
        return 1;
      }
      if (aVal > bVal) {
        return -1;
      }
      return 0;
    });
  } else {
    return items.sort((a: any, b: any) => {
      const aVal = find(a.Cells, ['Key', sortBy]).Value;
      const bVal = find(b.Cells, ['Key', sortBy]).Value;

      if (aVal < bVal) {
        return -1;
      }
      if (aVal > bVal) {
        return 1;
      }
      return 0;
    });
  }
}

/**
 * Sorting function used for search results sorting
 *
 * @param items
 * @param descending
 */
export function sortCalendarEvents(items: any, descending = false) {
  if (descending) {
    return items.sort((a: any, b: any) => {
      const aVal = a.start.dateTime;
      const bVal = b.start.dateTime;

      if (aVal < bVal) {
        return 1;
      }
      if (aVal > bVal) {
        return -1;
      }
      return 0;
    });
  } else {
    return items.sort((a: any, b: any) => {
      const aVal = a.start.dateTime;
      const bVal = b.start.dateTime;

      if (aVal < bVal) {
        return -1;
      }
      if (aVal > bVal) {
        return 1;
      }
      return 0;
    });
  }
}

/**
 * Gets the URLS params which contain the path of the current active branch
 */
export function getUrlParams(): any {
  const search: string = window.location.search;
  const params: any[] = [];

  search
    .slice(search.indexOf('?') + 1)
    .split('&')
    .forEach((hash: string) => {
      const [key, val]: any = hash.split('=');
      params[key] = decodeURIComponent(val);
    });

  return params;
}

/**
 * Creates HTML markup for use in React's dangerouslySetInnerHTML. Removes <img /> as they don't render coming from Outlook.
 *
 * @param html - raw HTML string
 */
export function createMarkup(
  html: string,
  options?: {
    removeImg?: boolean;
    removeStyles?: boolean;
  }
) {
  let cleanHtml = html;

  if (options) {
    if (options.removeImg) {
      cleanHtml = cleanHtml.replace(/<img .*>/g, '');
    }

    if (options.removeStyles) {
      cleanHtml = cleanHtml.replace(
        /<style([\S\s]*?)>([\S\s]*?)<\/style>/gi,
        ''
      );
    }
  }

  return { __html: cleanHtml };
}
/**
 * Get date/time since activity
 */
export function getTimeSinceActivity(dateTime: string) {
  const now = Date.now();
  const activityTime = new Date(dateTime);

  if (now - activityTime.getTime() < 3600000) {
    const time = Math.ceil((now - activityTime.getTime()) / 60000);
    return `${time} min${time > 1 ? 's' : ''} ago`;
  }

  if (now - activityTime.getTime() > 43200000) {
    return getFormattedDateTime(
      dateTime,
      {
        month: 'numeric',
        day: 'numeric'
      },
      'en-AU',
      'UTC'
    );
  }

  return getFormattedDateTime(
    dateTime,
    {
      hour: 'numeric',
      minute: 'numeric'
    },
    'en-AU',
    'UTC'
  );
}
