import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

export interface LinkListItem {
  label: string
  Icon?: (props: { className: string }) => JSX.Element
  tags?: string[]

  path?: string
  onClick?: () => void

  nested?: LinkListItem[]
}

const SingleLink = (props: LinkListItem) => {
  const { label, Icon, tags, path } = props;
  const router = useRouter();

  return (
    <Link
      href={path as string}
      className={'w-full p-2 flex items-center rounded-lg hover:bg-zinc-700 ' + (router.asPath === path ? 'bg-zinc-700' : '')}
    >
      {Icon ? <Icon className='w-6 h-6 text-zinc-400' /> : <div className='w-6 h-6' />}
      <span className='ml-3 mr-auto truncate'>{label}</span>

      {tags?.map((tag) => (
        <span
          key={`nav-${label}-tag-${tag}`}
          className='mx-0.5 px-1.5 text-sm font-medium rounded-full border-2 border-transparent text-zinc-400 bg-zinc-700'
        >
          {tag}
        </span>
      ))}
    </Link>
  );
};

const SingleButton = (props: LinkListItem) => {
  const { label, Icon, tags, onClick } = props;

  return (
    <button onClick={() => (onClick ? onClick() : null)} className='w-full p-2 flex items-center rounded-lg hover:bg-zinc-700'>
      {Icon ? <Icon className='w-6 h-6 text-zinc-400' /> : <div className='w-6 h-6' />}
      <span className='ml-3 mr-auto truncate'>{label}</span>

      {tags?.map((tag) => (
        <span
          key={`nav-${label}-tag-${tag}`}
          className='mx-0.5 px-1.5 text-sm font-medium rounded-full border-2 border-transparent text-zinc-400 bg-zinc-700'
        >
          {tag}
        </span>
      ))}
    </button>
  );
};

const DropdownLinks = (props: LinkListItem) => {
  const { label, Icon, tags, path, onClick, nested } = props;
  const [open, setOpen] = useState(false);

  return (
    <div className='w-full'>
      <SingleButton label={label} Icon={Icon} tags={tags} onClick={() => setOpen((prev) => !prev)} />

      {open ? (
        <ul className='py-2 space-y-2'>
          {nested?.map((item) => (
            <li key={`nav-${item.label}`}>
              {nested?.length ? <DropdownLinks {...item} /> : path ? <SingleLink {...item} /> : onClick ? <SingleButton {...item} /> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

const LinkList = (props: { items: LinkListItem[] }) => {
  const { items } = props;

  return (
    <ul className='space-y-2'>
      {items.map((item) => {
        const { label, path, onClick, nested } = item;

        return (
          <li key={`nav-${label}`}>
            {nested?.length ? (
              <DropdownLinks {...item} />
            ) : path ? (
              <SingleLink {...item} />
            ) : onClick ? (
              <SingleButton {...item} />
            ) : (
              <SingleButton {...item} />
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default LinkList;
