import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { StudyGuide } from '../../types';
import { studyGuideService } from '../../services/study-guide.service';
import { toast } from 'react-toastify';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Input from '../shared/Input';
import Textarea from '../shared/Textarea';
import ConfirmDialog from '../shared/ConfirmDialog';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.75rem;
  border-bottom: 2px solid var(--border-color);
  color: var(--text-secondary);
`;

const Td = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ActionButton = styled(Button)`
  margin-left: 0.5rem;
`;

const StudyGuideManager: React.FC = () => {
  const [guides, setGuides] = useState<StudyGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  });

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = async () => {
    try {
      setLoading(true);
      const guides = await studyGuideService.getStudyGuides();
      setGuides(guides);
      setError(null);
    } catch (err) {
      console.error('Error loading study guides:', err);
      setError('Failed to load study guides');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await studyGuideService.createStudyGuide({
        ...formData,
        status: 'draft',
      });

      setFormData({
        title: '',
        description: '',
        category: '',
      });

      toast.success('Study guide created successfully');
      loadGuides();
    } catch (err) {
      console.error('Error creating study guide:', err);
      toast.error('Failed to create study guide');
    }
  };

  const handleDelete = async () => {
    if (!selectedGuideId) return;

    try {
      await studyGuideService.deleteStudyGuide(selectedGuideId);
      toast.success('Study guide deleted successfully');
      loadGuides();
    } catch (err) {
      console.error('Error deleting study guide:', err);
      toast.error('Failed to delete study guide');
    } finally {
      setShowDeleteDialog(false);
      setSelectedGuideId(null);
    }
  };

  if (loading) {
    return <Card>Loading study guides...</Card>;
  }

  if (error) {
    return (
      <Card>
        <div style={{ color: 'var(--error-color)', textAlign: 'center' }}>{error}</div>
        <Button variant="primary" onClick={loadGuides}>
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <h2>Study Guide Management</h2>

      <Form onSubmit={handleSubmit}>
        <Input
          label="Title"
          value={formData.title}
          onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
        <Textarea
          label="Description"
          value={formData.description}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
        />
        <Input
          label="Category"
          value={formData.category}
          onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
          required
        />
        <Button type="submit" variant="primary">
          Create Study Guide
        </Button>
      </Form>

      <Table>
        <thead>
          <tr>
            <Th>Title</Th>
            <Th>Category</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {guides.map(guide => (
            <tr key={guide.id}>
              <Td>{guide.title}</Td>
              <Td>{guide.category}</Td>
              <Td>{guide.status}</Td>
              <Td>
                <ActionButton
                  variant="secondary"
                  onClick={() => {
                    setSelectedGuideId(guide.id);
                    setShowDeleteDialog(true);
                  }}
                >
                  Delete
                </ActionButton>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      <ConfirmDialog
        title="Delete Study Guide"
        message="Are you sure you want to delete this study guide? This action cannot be undone."
        onConfirm={handleDelete}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedGuideId(null);
        }}
        isOpen={showDeleteDialog}
      />
    </Card>
  );
};

export default StudyGuideManager;
