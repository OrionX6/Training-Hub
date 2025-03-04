-- Ensure all study guides are published
UPDATE public.study_guides
SET status = 'published'
WHERE status = 'draft';

-- Add a comment to explain what this migration does
COMMENT ON TABLE public.study_guides IS 'Study guides that are accessible to all users. Published guides are publicly readable.';

-- Create a trigger to log study guide status changes
CREATE OR REPLACE FUNCTION public.log_study_guide_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status <> OLD.status THEN
        RAISE NOTICE 'Study guide % status changed from % to %', NEW.id, OLD.status, NEW.status;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER study_guide_status_change
    BEFORE UPDATE ON public.study_guides
    FOR EACH ROW
    EXECUTE FUNCTION public.log_study_guide_status_change();

-- Update the policy descriptions to be more clear
COMMENT ON POLICY "Study guides are publicly readable" ON public.study_guides
    IS 'Anyone can view published study guides without authentication';
    
COMMENT ON POLICY "Anonymous can read published study guides" ON public.study_guides
    IS 'Anonymous users can view published study guides without logging in';
