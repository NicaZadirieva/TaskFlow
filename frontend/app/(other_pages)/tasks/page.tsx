import fromGithubLabelOut from '@/api/dto/github_label/get_all/mappers/fromGithubLabelOut';
import { fromTaskDto } from '@/api/mappers';
import { getTasksReq } from '@/api/requests';
import { DeadlineFilter, PriorityTaskFilter, StatusTaskFilter, TasksInKanban } from '@/components/ui/task';
import MultipleFilterDropdown from '@/components/ui/task/features/MultipleFilterDropdown';
import { FilterOptionData } from '@/components/ui/task/features/MultipleFilterDropdown/MultipleFilterDropdownProps.props';
import { GithubLabelDefaultColor } from '@/entities/githubLabel.interface';
import styles from "./page.module.css";

export default async function ListAllTasksPage() {
  const tasks = await getTasksReq();
  if (tasks) {
    const mappedTasks = tasks.tasks.map(fromTaskDto);
    const mappedAllTags = tasks.allTags?.map(fromGithubLabelOut);
    const tagsStorage = mappedAllTags?.map((tag) => {
      return { value: tag.id.toString(), label: tag.name, dotHexColor: GithubLabelDefaultColor} as FilterOptionData;
    })
    const assigneesStorage = tasks.allAssignees?.map((assignee) => {
      return { value: assignee.userId.toString(), label: assignee.userName } as FilterOptionData;
    })
    return (
    <div style={{ background: '#f5f6f8', minHeight: '100vh', padding: 32 }}>
      <div className={styles.filters}>
          <PriorityTaskFilter />
          <StatusTaskFilter />
          {tagsStorage && <MultipleFilterDropdown storage={tagsStorage} optionsGroupName='Теги' widthInPx={150}/>}
          {assigneesStorage && <MultipleFilterDropdown showSearch={true} storage={assigneesStorage} optionsGroupName='Исполнители' widthInPx={200} />}
          <DeadlineFilter />
      </div>
        
        <TasksInKanban tasks={mappedTasks} />
    </div>
  );
  }
  
}