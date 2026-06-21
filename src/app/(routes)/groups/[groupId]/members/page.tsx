'use client';
import { useGroup, useGroupMembers } from '@/features/group';
import { FormatDate, splitName } from '@/shared';
import { Avatar } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui/Button';
import { GROUP_ROLES } from '@/types/entites';
import { notFound } from 'next/navigation';
import { use } from 'react';

const MAX_MEMBERS = 6;

const GroupPage = ({ params }: { params: Promise<{ groupId: string }> }) => {
    const { groupId } = use(params);

    // Fetch group data using hook
    const { data: group, isLoading: isLoadingGroup } = useGroup(groupId);

    // Fetch members using hook
    const { data: members, isLoading: isLoadingMembers } = useGroupMembers(groupId, { page: 1, pageSize: 200 });

    const isLoading = isLoadingGroup || isLoadingMembers;

    if (isLoading) {
        return <div className="rounded-xl bg-secondary-1 p-2 text-center dark:bg-dark-secondary-1">Đang tải...</div>;
    }

    if (!group) {
        return notFound();
    }

    return (
        <div className="rounded-xl bg-secondary-1 p-2 dark:bg-dark-secondary-1">
            <div>
                <h1 className="text-sm font-bold">Quản trị viên</h1>
                <div className="mt-2">
                    {members &&
                        members.data
                            .filter((m) => m.role == GROUP_ROLES.ADMIN)
                            .map((member) => (
                                <Button
                                    href={`/groups/${group._id}/members/${member.user._id}`}
                                    className="min-w-[200px] justify-start"
                                    key={member._id}
                                    variant={'ghost'}
                                    size={'md'}
                                >
                                    <Avatar
                                        className="mr-2"
                                        onlyImage
                                        width={32}
                                        height={32}
                                        imgSrc={member.user.avatar}
                                    />

                                    <span>{member.user.name}</span>
                                </Button>
                            ))}
                </div>
            </div>

            <div className="mt-2">
                <h1 className="text-sm font-bold">Thành viên</h1>
                <div className="mt-2 grid grid-cols-3 gap-2 lg:grid-cols-2 md:grid-cols-1">
                    {members &&
                        members.data
                            .filter((m) => m.role == GROUP_ROLES.MEMBER)
                            .slice(0, MAX_MEMBERS)
                            .map((member) => (
                                <Button
                                    href={`/groups/${group._id}/members/${member.user._id}`}
                                    className="min-w-[200px] justify-start"
                                    key={member._id}
                                    variant={'ghost'}
                                    size={'md'}
                                >
                                    <Avatar
                                        onlyImage
                                        className="mr-2"
                                        width={32}
                                        height={32}
                                        imgSrc={member.user.avatar}
                                    />

                                    <div className="flex flex-col">
                                        <span>{member.user.name}</span>

                                        <span className="text-xs text-gray-500">
                                            Tham gia vào {FormatDate.formatISODateToDateTime(member.joinedAt)}
                                        </span>
                                    </div>
                                </Button>
                            ))}

                    {members &&
                        (() => {
                            const totalMemberCount = members.data.filter((m) => m.role === GROUP_ROLES.MEMBER).length;
                            const remainingMembers = totalMemberCount - MAX_MEMBERS;

                            return remainingMembers > 0 && <h5>và {remainingMembers} thành viên khác</h5>;
                        })()}
                </div>
            </div>
        </div>
    );
};
export default GroupPage;
