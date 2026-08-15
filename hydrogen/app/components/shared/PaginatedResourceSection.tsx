import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';
import {Spinner} from '~/components/ui/Spinner';

export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  resourcesClassName,
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: React.FunctionComponent<{node: NodesType; index: number}>;
  resourcesClassName?: string;
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        return (
          <div className="flex flex-col gap-8">
            <PreviousLink className="mx-auto inline-flex items-center justify-center gap-2 px-8 py-3 text-sm font-medium text-text bg-transparent border border-border rounded-lg hover:border-text hover:bg-surface-hover transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? (
                <>
                  <Spinner size="sm" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m18 15-6-6-6 6" />
                  </svg>
                  <span>Load previous</span>
                </>
              )}
            </PreviousLink>
            {resourcesClassName ? (
              <div className={resourcesClassName}>{resourcesMarkup}</div>
            ) : (
              resourcesMarkup
            )}
            <NextLink className="mx-auto inline-flex items-center justify-center gap-2 px-8 py-3 text-sm font-medium text-text bg-transparent border border-border rounded-lg hover:border-text hover:bg-surface-hover transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? (
                <>
                  <Spinner size="sm" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Load more</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </>
              )}
            </NextLink>
          </div>
        );
      }}
    </Pagination>
  );
}
